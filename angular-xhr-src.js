(function() {
	'use strict';

	function xhrSrc($http, $window) {
		var directive = {
				restrict: 'A',
				scope: true,
				template: '',
				replace: true,
				link: linkFunction
			},
			fileCache = {},
			count = 0;

		window.showTime = function() {
			console.log((window.lastTime - window.firstTime) / 1000);

			count = 0;
			window.firstTime = window.lastTime = undefined;
		}

		return directive;

		function linkFunction(scope, element, attrs) {
			var elt = element[0];

			attrs.$observe('xhrSrc', sourceAttributeObserver);
			attrs.$observe('xhrHref', sourceAttributeObserver);

			function sourceAttributeObserver(source) {
				var cachedFileObject;

				if (source !== undefined) {
					cachedFileObject = fileCache[source];

					if (cachedFileObject !== undefined) {
						elementAssignResource(elt, cachedFileObject);
					}
					if (count === 0) {
						window.firstTime = window.lastTime = +(new Date());
					}
					if (cachedFileObject !== undefined) {
						window.lastTime = +(new Date());
						count++;

						return;
					}

					$http.get(source, {responseType: 'blob'})
						.then(
							function(response) {
								fileCache[source] = $window.URL.createObjectURL(response.data);
								elementAssignResource(elt, fileCache[source]);

								window.lastTime = +(new Date());

								//console.log('xhrSrc: ' + count++);
								count++;
							},
							function(result) {
								var data = typeof(result.data) === "object" ? JSON.stringify(result.data) : result.data;
								var resultMessage = 'status code: ' + result.status + ' status: ' + result.statusText + ' data: ' + data;
								throw new Error('Result retrieving source ' + source + ': ' + resultMessage);
							}
						);
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

	function xhrArrayBufferSrc($http, $window) {
		var directive = {
				restrict: 'A',
				scope: true,
				template: '',
				replace: true,
				link: linkFunction
			},
			count = 0;

		window.showTime = function() {
			console.log((window.lastTime - window.firstTime) / 1000);

			count = 0;
			window.firstTime = window.lastTime = undefined;
		}

		return directive;

		function linkFunction(scope, element, attrs) {
			var elt = element[0];

			attrs.$observe('xhrArrayBufferSrc', sourceAttributeObserver);
			attrs.$observe('xhrArrayBufferHref', sourceAttributeObserver);

			function sourceAttributeObserver(source) {
				if (source !== undefined) {

					if (count === 0) {
						window.firstTime = window.lastTime = +(new Date());
					}

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

								window.lastTime = +(new Date());

								//console.log('xhrArrayBufferSrc: ' + count++);
								count++;
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
})();
