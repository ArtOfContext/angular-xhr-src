'use strict';

angular.module('demoXhrSrc', ['xhrSrc'])
	.controller('ImageController', function($scope) {
		$scope.imageUrl = 'http://placehold.it/400x250/000000/ff0000/&text=xhr-src%20works!';
	});
