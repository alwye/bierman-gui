app.controller('biermanCtrl', function($scope) {

	$scope.topologyInit = false;

	$scope.startOver = function(){
		$scope.mode = 'ingress';
		$scope.currentTree = {
			'ingress': null,
			'egress': [],
			'links': []
		};
		if($scope.topologyInit)
			$scope.topologyStartOver();
	};

});