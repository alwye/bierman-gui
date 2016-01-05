app.controller('biermanCtrl', function($scope, BiermanRest) {

	// BIER Manager configuration
	$scope.appConfig = {
		// FOR MANUAL CONFIGURATION
		'ctrlHost': '10.124.19.145', // IP address of controller
		'ctrlPort': '8181', // Port of controller (8181 by default)
		'ctrlUsername': 'admin', // Username for controller
		'ctrlPassword': 'admin', // Password for user
		'httpMaxTimeout': 10000, // Maximum timeout in milliseconds for HTTP requests
		// DO NOT MODIFY CONFIGURATION BELOW
		'mode': 'init', // Application mode (do not modify)
		'topoInitialized': false
	};

	var biermanRest = new BiermanRest($scope.appConfig);

	// Topology data in Common Topology Model style
	$scope.topologyData = {
		'nodes': [],
		'links': []
	};

	$scope.initApp = function(){
		$scope.appConfig.mode = 'start';
		$scope.currentTree = {
			'ingress': null,
			'egress': [],
			'links': []
		};
		if($scope.appConfig.topoInitialized)
			$scope.resetTopology();
	};


	$scope.selectPath = function(){
		$scope.appConfig.mode = 'draw';
	};

	$scope.validateTree = function(){
		alert('not ready yet');
	};

	$scope.processTopologyData = function(data){
		console.log(data);
		return data;
	};


	console.log(biermanRest.getTopology());


});