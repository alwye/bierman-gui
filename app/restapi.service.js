/* This Angular Service implements REST Interface for BIER Manager */
app.factory('BiermanRest', function($http){

	var BiermanRest = function(appConfig){
		this.appConfig = appConfig;
	};

	// Shortcut for controller's host + port
	BiermanRest.prototype.getBaseUrl = function(){
		return 'http://' + this.appConfig.ctrlHost + ':' + this.appConfig.ctrlPort;
	};

	// Read topology from the controller
	BiermanRest.prototype.getTopology = function(){
		var self = this;

		var httpResult = $http({
			'url': self.getBaseUrl() + '/restconf/operational/network-topology:network-topology/',
			'withCredentials': true,
			'method': 'JSONP',
			'headers': {
				'Authorization': 'Basic '+ self.appConfig.ctrlUsername +':' + self.appConfig.ctrlPassword,
				'Access-Control-Allow-Methods': 'GET, JSONP',
				'Access-Control-Allow-Origin': '*'
			},
			'timeout': this.appConfig.httpMaxTimeout
		}).then(
			// loaded
			function (data, textStatus, jqXHR){
				console.log(data);
				return data;
			},
			// failed
			function(jqXHR, textStatus, errorThrown){
				//console.error("Could not fetch topology data from server: " + textStatus);
				return false;
			});

	};

	// Compute BIER TE FMASK for specified link
	BiermanRest.computeFmask = function(data){

	};

	// Compute Top-K shortest paths
	BiermanRest.computeTopKShortestPaths = function(data){

	};

	return BiermanRest;

});