'use strict';

angular.module('demoXhrSrc', ['xhrSrc'])
	.controller('ImageController', function($scope) {
		$scope.imageUrl = 'http://feeds.massport.com/dsfids/icons/AirlineLogos200x36/DL.gif';
	});
