/* global window, chrome */

(function(global, debug) {
	'use strict';

	var fileCache = {};

	function xhrSrc($http, $window) {
		var directive = {
			restrict: 'A',
			scope: true,
			template: '',
			replace: true,
			link: linkFunction
		};

		return directive;

		function linkFunction(scope, element, attrs) {
			var elt = element[0];

			attrs.$observe('xhrSrc', sourceAttributeObserver);
			attrs.$observe('xhrHref', sourceAttributeObserver);

			function sourceAttributeObserver(source) {
				if (source !== undefined) {
					retrieve(source, function(cachedFileObject) {
						if (cachedFileObject !== undefined) {

							console.log('found in the cache');
							// cache hit, use it
							elementAssignResource(elt, $window.URL.createObjectURL(cachedFileObject));

							updateDebug();

							return;
						}
						else {
							console.log('NOT found in the cache, retrieving from XHR');
							// not a cache hit, request it
							$http.get(source, {responseType: 'blob'})
								.then(
									function(response) {
										// received response, cache it
										store(source, response.data);

										// and use it
										elementAssignResource(elt, $window.URL.createObjectURL(response.data));

										updateDebug();
									},
									function(result) {
										var data = typeof(result.data) === "object" ? JSON.stringify(result.data) : result.data;
										var resultMessage = 'status code: ' + result.status + ' status: ' + result.statusText + ' data: ' + data;
										throw new Error('Result retrieving source ' + source + ': ' + resultMessage);
									}
								);
						}
					});
				}
			}
		}
	}

	function elementAssignResource(element, resource) {
		if (element.tagName === 'LINK') {
			element.href = resource;
		}
		else if (element.tagName === 'IMG') {
			element.src = resource;
		}
		else {
			throw new Error('xhrSrc directive only supports setting LINK href and IMG src');
		}
	}

	function useChromeStorage() {
		return chrome !== undefined &&
			chrome.storage !== undefined &&
			chrome.storage.local !== undefined;
	}

	function store(key, fileObject) {
		if (useChromeStorage()) {
			storeChromeStorage(key, fileObject);
		}
		else {
			storeFileCacheHash(key, fileObject);
		}
	}

	function storeFileCacheHash(key, fileObject) {
		fileCache[key] = fileObject;
	}

	function storeChromeStorage(key, fileObject) {
		var valueToSet = {};
		valueToSet[key] = fileObject;

		chrome.storage.local.set(valueToSet, function () {
			if (chrome.runtime.lastError !== undefined) {
				throw new Error('Error caching file object results: ' + chrome.runtime.lastError.message);
			}
		});
	}

	function retrieve(key, callback) {
		if (useChromeStorage()) {
			retrieveChromeStorage(key, callback);
		}
		else {
			retrieveFileCacheHash(key, callback);
		}
	}

	function retrieveFileCacheHash(key, callback) {
		callback(fileCache[key]);
	}

	function retrieveChromeStorage(key, callback) {
		chrome.storage.local.get(key, function(items) {
			callback(items[key]);
		});
	}

	if (debug) {
		// put on global scope so we can get time from console
		global.xhrSrcShowTime = function() {
			console.log((global.xhrSrcLastTime - global.xhrSrcFirstTime) / 1000);

			global.xhrSrcItemCount = 0;
			global.xhrSrcFirstTime = global.xhrSrcLastTime = undefined;
		};
	}

	function updateDebug() {
		if (debug) {
			if (global.xhrSrcItemCount === undefined) {
				global.xhrSrcItemCount = 0;
			}

			if (global.xhrSrcItemCount === 0) {
				global.xhrSrcFirstTime = global.xhrSrcLastTime = +(new Date());
				global.xhrSrcItemCount++;
			}
			else {
				global.xhrSrcLastTime = +(new Date());
				global.xhrSrcItemCount++;
			}
		}
	}

	/* --------------------------------------------------------- */

	function xhrArrayBufferSrc($http) {
		var directive = {
			restrict: 'A',
			scope: true,
			template: '',
			replace: true,
			link: linkFunction
		};

		return directive;

		function linkFunction(scope, element, attrs) {
			var elt = element[0];

			attrs.$observe('xhrArrayBufferSrc', sourceAttributeObserver);
			attrs.$observe('xhrArrayBufferHref', sourceAttributeObserver);

			function sourceAttributeObserver(source) {
				if (source !== undefined) {

					retrieve(source, function(cachedFileObject) {
						if (cachedFileObject !== undefined) {
							console.log('found in the cache');

							// cache hit, use it
							elementAssignResource(elt, cachedFileObject);

							updateDebug();

							return;
						}
						else {
							console.log('NOT found in the cache, retrieving from XHR');

							$http.get(source, {responseType: 'arraybuffer'})
								.then(
									function(response) {
										var base64 = getBase64Content(response.data),
											dataUrl = getDataUrl(source, elt.tagName, base64);

										// received response, cache it
										store(source, dataUrl);

										elementAssignResource(elt, dataUrl);

										updateDebug();
									},
									function(result) {
										var data = typeof(result.data) === "object" ? JSON.stringify(result.data) : result.data;
										var resultMessage = 'status code: ' + result.status + ' status: ' + result.statusText + ' data: ' + data;
										throw new Error('Result retrieving source ' + source + ': ' + resultMessage);
									}
								);
						}
					});

				}
			}
		}

		function getBase64Content(responseData) {
			var uInt8Array = new Uint8Array(responseData);
			var i = uInt8Array.length;
			var binaryString = new Array(i);

			while (i--)
			{
				binaryString[i] = String.fromCharCode(uInt8Array[i]);
			}
			var data = binaryString.join('');
			return window.btoa(data);
		}

		function getDataUrl(source, tagName, base64Content) {
			var lowercaseSource = source.toLowerCase(),
				imageType;

			if (tagName === 'LINK' && lowercaseSource.indexOf('.css')) {
				return 'data:text/css;base64,' + base64Content;
			}
			else if (tagName === 'IMG') {

				if (lowercaseSource.indexOf('.jpg') !== -1) {
					imageType = 'image/jpg';
				}
				else if (lowercaseSource.indexOf('.gif') !== -1) {
					imageType = 'image/gif';
				}
				else {
					imageType = 'image/png';
				}

				return 'data:' + imageType + ';base64,' + base64Content;
			}

			return '';
		}
	}

	angular.module('xhrSrc', []);
	angular.module('xhrSrc')
		.directive('xhrSrc', xhrSrc)
		.directive('xhrHref', xhrSrc);

	angular.module('xhrArrayBufferSrc', []);
	angular.module('xhrArrayBufferSrc')
		.directive('xhrArrayBufferSrc', xhrArrayBufferSrc)
		.directive('xhrArrayBufferHref', xhrArrayBufferSrc);

})(window, true);
