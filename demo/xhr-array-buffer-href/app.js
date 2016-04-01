'use strict';

angular.module('demoXhrArrayBufferHref', ['xhrArrayBufferSrc'])
	.controller('StyleController', function($scope) {
		$scope.stylesheetUrl = 'http://getbootstrap.com/dist/css/bootstrap.min.css';
	});
