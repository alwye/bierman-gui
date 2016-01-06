/* This Angular Service implements REST Interface for BIER Manager */
app.factory('BiermanRest', function($http){

	var BiermanRest = function(appConfig){
		this.appConfig = appConfig;
	};

	// Shortcut for controller's host + port
	BiermanRest.prototype.getBaseUrl = function(){
		return 'http://' + this.appConfig.ctrlUsername + ':' + this.appConfig.ctrlPassword + '@' + this.appConfig.ctrlHost + ':' + this.appConfig.ctrlPort;
	};

	// Read topology from the controller
	BiermanRest.prototype.loadTopology = function(successCbk, errorCbk){
		var self = this;
		$http({
			'url': self.getBaseUrl() + '/restconf/operational/network-topology:network-topology/',
			'withCredentials': true,
			'method': 'GET',
			'timeout': this.appConfig.httpMaxTimeout
		}).then(
			// loaded
			function (data, textStatus, jqXHR){
				data = data.data['network-topology'].topology;
				// fixme: we need clarification on that
				for(var i = 0; i < data.length; i++)
					if(data[i].hasOwnProperty('node') && data[i].hasOwnProperty('link'))
					{
						data = data[i];
						break;
					}
				successCbk(data);
			},
			// failed
			function(jqXHR, textStatus, errorThrown){
				var errMsg = "Could not fetch topology data from server: " + textStatus;
				errorCbk(errMsg);
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