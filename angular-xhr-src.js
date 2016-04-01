(function() {
	'use strict';

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
					$http.get(source, {responseType: 'blob'})
						.then(
							function(response) {
								if (elt.tagName === 'LINK') {
									elt.href = $window.URL.createObjectURL(response.data);
								}
								else if (elt.tagName === 'IMG') {
									elt.src = $window.URL.createObjectURL(response.data);
								}
								else {
									throw new Error('xhrSrc directive only supports setting LINK href and IMG src');
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
								while (i--)
								{
									binaryString[i] = String.fromCharCode(uInt8Array[i]);
								}
								var data = binaryString.join('');
								var base64 = window.btoa(data);

								if (elt.tagName === 'LINK') {
									elt.href = "data:text/css;base64," + base64;
								}
								else if (elt.tagName === 'IMG') {
									elt.src = "data:image/png;base64," + base64;
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
})();
