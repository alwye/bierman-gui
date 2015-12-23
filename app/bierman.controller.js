app.controller('biermanCtrl', function($scope) {

	$scope.topologyInit = false;

	$scope.appConfig = {
		mode: 'start'
	};

	$scope.startOver = function(){
		$scope.appConfig.mode = 'start';
		$scope.currentTree = {
			'ingress': null,
			'egress': [],
			'links': []
		};
		if($scope.topologyInit)
			$scope.topologyStartOver();
	};

	$scope.selectPath = function(){
		$scope.appConfig.mode = 'draw';
	};

	$scope.validateTree = function(){
		alert('not ready yet');
	};



});