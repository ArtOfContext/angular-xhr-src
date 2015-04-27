'use strict';

angular.module('demoXhrHref', ['xhrSrc'])
	.controller('StyleController', function($scope) {
		$scope.stylesheetUrl = 'http://getbootstrap.com/dist/css/bootstrap.min.css';
	});
