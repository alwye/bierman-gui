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
			function (res){
				res = res.data;
				if(res.status == 'ok'){
					res = res.data['network-topology'].topology;
					// fixme: we need clarification on that
					var validRes = null;
					for(var i = 0; i < res.length; i++){
						if(res[i].hasOwnProperty('node') && res[i].hasOwnProperty('link'))
						{
							validRes = res[i];
							break;
						}
					}
					if(validRes != null){
						successCbk(validRes);
					}
					else{
						console.log(res);
						errorCbk("Node/link data is missing.");
					}
				}
				else{
					errorCbk("Proxy returned error status: " + JSON.stringify(res.data));
				}
			},
			// failed
			function(err){
				var errMsg = "Could not fetch topology data from server";
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
					// if controller returned errors
					if(data.data.data.hasOwnProperty('errors')){
						errorCbk({'errObj': data.data.data.errors, 'errId': 2,'errMsg': 'Controller found out errors'});
					}
					else{
						try{
							data = data.data.data.output;
							successCbk(data);
						}
						catch(e){
							var errMsg = "Invalid JSON response returned to computeMask";
							errorCbk({'errObj': e, 'errId': 3, 'errMsg': errMsg});
						}
					}
				}
				else{
					errorCbk({'errObj': data.data.data, 'errId': 1, 'errMsg': 'Proxy status other than ok'});
				}

			},
			// failed
			function(e){
				var errMsg = "Could not fetch path data from server: " + e.statusText;
				errorCbk({'errObj': e, 'errId': 0, 'errMsg': errMsg});
			});
	};

	// get paths for specified topology
	BiermanRest.prototype.getChannels = function(topologyId, successCbk, errorCbk){
		var self = this;
		$http({
			'url': self.getProxyURL() + '/restconf/operations/bier:get-channel',
			'method': 'POST',
			'timeout': this.appConfig.httpMaxTimeout,
			'data': JSON.stringify({
				'input': {
					'topo-id': topologyId
				}
			})
		}).then(
			// loaded
			function (data){
				if(data.data.status == 'ok')
				{
					// if controller returned errors
					if(data.data.data.hasOwnProperty('errors')){
						errorCbk({'errObj': data.data.data.errors, 'errId': 2,'errMsg': 'Controller found out errors'});
					}
					// if output is set
					else if(data.data.data.hasOwnProperty('output')){
						if(data.data.data.output.hasOwnProperty('channel')){
							successCbk(data.data.data.output.channel);
						}
						else{
							successCbk([]);
						}
					}
					// if neither output nor errors
					else{
						var errMsg = "Invalid JSON response returned to getChannel";
						errorCbk({'errObj': e, 'errId': 3, 'errMsg': errMsg});
					}
				}
				else{
					errorCbk({'errObj': data.data.data, 'errId': 1, 'errMsg': 'Proxy status other than ok'});
				}

			},
			// failed
			function(e){
				var errMsg = "Could not fetch channel data from server: " + e.statusText;
				errorCbk({'errObj': e, 'errId': 0, 'errMsg': errMsg});
			});
	};

	// Add channel
	BiermanRest.prototype.addChannel = function(input, successCbk, errorCbk){
		if(biermanTools.hasOwnProperties(input, ['topo-id', 'channel-name', 'src-ip', 'dst-group', 'sub-domain'])){
			var self = this;
			$http({
				'url': self.getProxyURL() + '/restconf/operations/bier:add-channel',
				'method': 'POST',
				'timeout': this.appConfig.httpMaxTimeout,
				'data': JSON.stringify({
					'input': {
						'topo-id': input['topo-id'],
						'channel-name': input['channel-name'],
						'src-ip': input['src-ip'],
						'dst-group': input['dst-group'],
						'sub-domain': input['sub-domain']
					}
				})
			}).then(
				// loaded
				function (data){
					if(data.data.status == 'ok')
					{
						// if controller returned errors
						if(data.data.data.hasOwnProperty('errors')){
							errorCbk({'errObj': data.data.data.errors, 'errId': 3,'errMsg': 'Controller found out errors'});
						}
						else{
							try{
								successCbk(data);
							}
							catch(e){
								var errMsg = "Invalid JSON response returned to addChannel";
								errorCbk({'errObj': e, 'errId': 4, 'errMsg': errMsg});
							}
						}
					}
					else{
						errorCbk({'errObj': data.data.data, 'errId': 2, 'errMsg': 'Proxy status other than ok'});
					}

				},
				// failed
				function(e){
					var errMsg = "Could not fetch channel data from server: " + e.statusText;
					errorCbk({'errObj': e, 'errId': 1, 'errMsg': errMsg});
				});

		}
		else{
			errorCbk({'errObj': input, 'errId': 0, 'errMsg': 'Input is not valid'});
		}
	};

	BiermanRest.removeChannel = function(input, successCbk, errorCbk){

	};

	// Compute Top-K shortest paths
	BiermanRest.computeTopKShortestPaths = function(data){

	};

	return BiermanRest;

});