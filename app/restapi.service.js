/* This Angular Service implements REST Interface for BIER Manager */
app.factory('biermanRest', function(){

	// Read topology from the controller
	var getTopology = function(){
		// todo: get it in angular-ish style
		$http({
			'url': $scope.getBaseUrl() + '/restconf/operational/network-topology:network-topology/',
			'dataType': 'json',
			'withCredentials': true,
			'username': $scope.appConfig.ctrlUsername,
			'password': $scope.appConfig.ctrlPassword,
			'timeout': $scope.appConfig.httpMaxTimeout
		}).get().then(
			// loaded
			function (data, textStatus, jqXHR){
				$scope.topologyData = $scope.processTopologyData(data);
				if($scope.topologyData)
					$scope.initTopology();
			},
			// failed
			function(jqXHR, textStatus, errorThrown){
				console.error("Could not fetch topology data from server: " + textStatus)
			});
	};

	// Compute BIER TE FMASK for specified link
	var computeFmask = function(data){

	};

	// Compute Top-K shortest paths
	var computeTopKShortestPaths = function(data){

	};


});