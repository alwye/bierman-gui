/* This Angular Service implements REST Interface for BIER Manager */
app.factory('BiermanRest', function($http){

	var BiermanRest = function(appConfig){
		this.appConfig = appConfig;
	};

	// Shortcut for controller's host + port
	BiermanRest.prototype.getProxyURL = function(){
		return 'http://' + this.appConfig.proxyHost + ':' + this.appConfig.proxyPort;
	};

	// Read topology from the controller
	BiermanRest.prototype.loadTopology = function(successCbk, errorCbk){
		var self = this;
		$http({
			'url': self.getProxyURL() + '/restconf/operational/network-topology:network-topology',
			'method': 'GET',
			'timeout': this.appConfig.httpMaxTimeout
		}).then(
			// loaded
			function (res){console.log(res);
				res = res.data;
				if(res.status == 'ok'){
					res = res.data['network-topology'].topology;
					// fixme: we need clarification on that
					for(var i = 0; i < res.length; i++)
						if(res[i].hasOwnProperty('node') && res[i].hasOwnProperty('link'))
						{
							res = res[i];
							break;
						}
					successCbk(res);
				}
				else{
					errorCbk("Proxy returned error status: " + JSON.stringify(res.data));
				}
			},
			// failed
			function(err){
				var errMsg = "Could not fetch topology data from server: " + err.statusText;
				errorCbk(errMsg);
			});
	};

	// Compute BIER TE FMASK for specified link
	BiermanRest.prototype.computeMask = function(data, successCbk, errorCbk){
		var self = this;
		$http({
			'url': self.getProxyURL() + '/restconf/operations/bier:compute-fmask',
			'method': 'POST',
			'timeout': this.appConfig.httpMaxTimeout,
			'data': JSON.stringify(data)
		}).then(
			// loaded
			function (data){
				if(data.data.status == 'ok')
				{
					try{
						data = data.data.data.output;
						successCbk(data);
					}
					catch(e){
						var errMsg = "Invalid JSON response to computeMask";
						errorCbk(errMsg);
					}
				}
				else{
					errorCbk(data.data.data);
				}

			},
			// failed
			function(err){
				var errMsg = "Could not fetch path data from server: " + err.statusText;
				errorCbk(errMsg);
			});
	};

	// Compute Top-K shortest paths
	BiermanRest.computeTopKShortestPaths = function(data){

	};

	return BiermanRest;

});