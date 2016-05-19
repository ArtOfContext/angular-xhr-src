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
				var cachedFileObject;

				if (source !== undefined) {
					cachedFileObject = retrieve(source);

					if (cachedFileObject !== undefined) {
						// cache hit, use it
						elementAssignResource(elt, cachedFileObject);

						updateDebug();

						return;
					}
					else {
						// not a cache hit, request it
						$http.get(source, {responseType: 'blob'})
							.then(
								function(response) {
									// received response, cache it
									store(source, $window.URL.createObjectURL(response.data));

									// and use it
									elementAssignResource(elt, retrieve(source));

									updateDebug();
								},
								function(result) {
									var data = typeof(result.data) === "object" ? JSON.stringify(result.data) : result.data;
									var resultMessage = 'status code: ' + result.status + ' status: ' + result.statusText + ' data: ' + data;
									throw new Error('Result retrieving source ' + source + ': ' + resultMessage);
								}
							);
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
		storeFileCacheHash(key, fileObject);
	}

	function retrieve(key) {
		if (useChromeStorage()) {
			return retrieveChromeStorage(key);
		}
		else {
			return retrieveFileCacheHash(key);
		}
	}

	function retrieveFileCacheHash(key) {
		return fileCache[key];
	}

	function retrieveChromeStorage(key) {
		return retrieveFileCacheHash(key);
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

	function xhrArrayBufferSrc($http, $window) {
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

					$http.get(source, {responseType: 'arraybuffer'})
						.then(
							function(response) {
								var uInt8Array = new Uint8Array(response.data);
								var i = uInt8Array.length;
								var binaryString = new Array(i);
								var imageType, lowercaseSource;

								while (i--)
								{
									binaryString[i] = String.fromCharCode(uInt8Array[i]);
								}
								var data = binaryString.join('');
								var base64 = window.btoa(data);

								if (elt.tagName === 'LINK') {
									elt.href = 'data:text/css;base64,' + base64;
								}
								else if (elt.tagName === 'IMG') {
									lowercaseSource = source.toLowerCase();

									if (lowercaseSource.indexOf('.jpg') !== -1) {
										imageType = 'image/jpg';
									}
									else if (lowercaseSource.indexOf('.gif') !== -1) {
										imageType = 'image/gif';
									}
									else {
										imageType = 'image/png';
									}

									elt.src = 'data:' + imageType + ';base64,' + base64;
								}
								else {
									throw new Error('xhrArrayBufferSrc directive only supports setting LINK href and IMG src');
								}
							},
							function(result) {
								var data = typeof(result.data) === "object" ? JSON.stringify(result.data) : result.data;
								var resultMessage = 'status code: ' + result.status + ' status: ' + result.statusText + ' data: ' + data;
								throw new Error('Result retrieving source ' + source + ': ' + resultMessage);
							}
						);
				}
			}
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
