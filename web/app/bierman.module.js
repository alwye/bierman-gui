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

	app.directive('mdRadioGroup', function() {
		return {
			restrict: 'E',
			link: function ($scope, $el, $attrs) {
				$el.on('keypress', function (event) {
					if (event.keyCode === 13) {
						var form = angular.element(getClosest($el[0], 'form'));
						form.triggerHandler('submit');
					}
					function getClosest (el, tag) {
						tag = tag.toUpperCase();
						do {
							if (el.nodeName === tag) {
								return el;
							}
						} while (el = el.parentNode);
						return null;
					}
				})
			}
		}
	});