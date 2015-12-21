app.controller('biermanCtrl', function($scope) {

	$scope.topologyInit = false;

	$scope.appConfig = {
		mode: 'ingress'
	};

	$scope.startOver = function(){
		$scope.appConfig.mode = 'ingress';
		$scope.currentTree = {
			'ingress': null,
			'egress': [],
			'links': []
		};
		if($scope.topologyInit)
			$scope.topologyStartOver();
	};

	$scope.selectPath = function(){
		$scope.appConfig.mode = 'path';
	};

	$scope.validateTree = function(){
		alert('not ready yet');
	};
});