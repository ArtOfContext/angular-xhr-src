/* global window, chrome */

(function(global, debug) {
	'use strict';

	var debugRequestTimeSpanFirst,
		debugRequestTimeSpanLast,
		debugItemCount;

	function xhrSrc($http, $window, xhrSrcCacheService) {
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
					// as chrome.storage deals with primitive types and not blobs, only cache
					// in local cache hash object
					xhrSrcCacheService.retrieveFileCacheHash(source, function(cachedFileObject) {
						if (cachedFileObject !== undefined) {
							// cache hit, use it
							console.log('found in the cache');
							elementAssignResource(elt, $window.URL.createObjectURL(cachedFileObject));

							updateDebug();

							return;
						}
						else {
							// not a cache hit, request it
							console.log('NOT found in the cache, retrieving from XHR');

							$http.get(source, {responseType: 'blob'})
								.then(
									function(response) {
										// received response, use it
										elementAssignResource(elt, $window.URL.createObjectURL(response.data));

										// and cache it
										xhrSrcCacheService.storeFileCacheHash(source, response.data);

										updateDebug();
									},
									logXHRError
								);
						}
					});
				}
			}
		}
	}

	function xhrArrayBufferSrc($http, xhrSrcCacheService) {
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

					xhrSrcCacheService.retrieve(source, function(cachedFileObject) {
						if (cachedFileObject !== undefined) {
							// cache hit, use it
							console.log('found in the cache');
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

										elementAssignResource(elt, dataUrl);

										// received response, cache it
										xhrSrcCacheService.store(source, dataUrl);

										updateDebug();
									},
									logXHRError
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

	function logXHRError(result) {
		var resource = result.config.url;
		var data = typeof(result.data) === "object" ? JSON.stringify(result.data) : result.data;
		var resultMessage = 'status code: ' + result.status + ' status: ' + result.statusText + ' data: ' + data;
		throw new Error('Result retrieving resource ' + resource + ': ' + resultMessage);
	}

	/*******************************************************/

	function xhrSrcCacheService() {
		var service = {
				'store': store,
				'retrieve': retrieve,
				'storeFileCacheHash': storeFileCacheHash,
				'retrieveFileCacheHash': retrieveFileCacheHash
			},
			fileCache = {};

		return service;

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
	}

	/*******************************************************/
	// Debug helpers

	if (debug) {
		// put on global scope so we can get time from console
		global.xhrSrcShowTime = function() {
			console.log((debugRequestTimeSpanLast - debugRequestTimeSpanFirst) / 1000);

			debugItemCount = 0;
			debugRequestTimeSpanFirst = debugRequestTimeSpanLast = undefined;
		};
	}

	function updateDebug() {
		if (debug) {
			if (debugItemCount === undefined) {
				debugItemCount = 0;
			}

			if (debugItemCount === 0) {
				debugRequestTimeSpanFirst = debugRequestTimeSpanLast = +(new Date());
				debugItemCount++;
			}
			else {
				debugRequestTimeSpanLast = +(new Date());
				debugItemCount++;
			}
		}
	}

	/*******************************************************/
	// Angular registrations

	angular.module('xhrSrc', []);
	angular.module('xhrSrc')
		.factory('xhrSrcCacheService', xhrSrcCacheService)
		.directive('xhrSrc', xhrSrc)
		.directive('xhrHref', xhrSrc);

	angular.module('xhrArrayBufferSrc', []);
	angular.module('xhrArrayBufferSrc')
		.factory('xhrSrcCacheService', xhrSrcCacheService)
		.directive('xhrArrayBufferSrc', xhrArrayBufferSrc)
		.directive('xhrArrayBufferHref', xhrArrayBufferSrc);

})(window, true);
