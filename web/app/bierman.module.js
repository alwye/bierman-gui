var app = angular.module('biermanApp', ['ngMaterial']);
	// configuration of color themes
	app.config(function($mdThemingProvider) {
		$mdThemingProvider.theme('default')
			.primaryPalette('blue')
			.accentPalette('light-blue');
	});
	app.directive('slideoutRight', function() {
		return {
			restrict: 'E',
			templateUrl: './app/templates/side-panel-index.tpl.html'
		};
	});