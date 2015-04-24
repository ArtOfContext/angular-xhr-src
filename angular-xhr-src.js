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
								throw new Error('Result retrieving source ' + source + ': ' + result);
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
})();
