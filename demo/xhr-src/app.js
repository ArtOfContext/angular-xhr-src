'use strict';

angular.module('demoXhrSrc', ['xhrSrc'])
	.controller('ImageController', function($scope) {
		$scope.imageUrl = 'http://cdn.jsdelivr.net/emojione/assets/png/1F414.png?v=1.2.4';
	});
