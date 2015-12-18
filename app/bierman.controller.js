app.controller('biermanCtrl', function($scope) {

	// settings
	$scope.mode = 'ingress';

	// initialization of a current bier tree
	$scope.currentTree = {
		'ingress': null,
		'egress': [],
		'links': []
	};



});