app.controller('biermanCtrl', function($scope, BiermanRest, $mdSidenav, $mdDialog, $mdMedia) {

	// BIER Manager configuration
	$scope.appConfig = {
		// FOR MANUAL CONFIGURATION
		'proxyHost': 'localhost', // IP address of controller
		'proxyPort': '5555', // Port of controller (8181 by default)
		'httpMaxTimeout': 10000, // Maximum timeout in milliseconds for HTTP requests
		'maxPacketLoss': 10,
		'spfMode': true, // SPF switch is set to this

		// DO NOT MODIFY CONFIGURATION BELOW
		'mode': 'init', // Application mode (do not modify)
		'topoInitialized': false,
		'currentPanel': null,
		'currentTopologyId': null
	};

	var biermanRest = new BiermanRest($scope.appConfig);

	// Topology data in Common Topology Model style
	$scope.topologyData = {
		'nodes': [],
		'links': []
	};

	// Available info about channels
	$scope.channelData = null;

	$scope.pathData = [];

	$scope.computedPaths = [];

	$scope.input = {
		'selectedPath': ''
	};

	$scope.displayAlert = function(options){
		swal(options);
	};

	$scope.clearCurrentTree = function(){
		$scope.currentTree = {
			'ingress': null,
			'egress': [],
			'links': [],
			'validStatus': 'none',
			'deploymentStatus': 'none',
			'fmask': '',
			'processedTree': {}
		};
	};

	$scope.getChannels = function(){
		biermanRest.getChannels(
			$scope.appConfig.currentTopologyId,
			function(data){
				$scope.channelData = data;
			},
			function(err){
				console.error(err);
				$scope.displayAlert({
					title: "Channels not loaded",
					text: err.errMsg,
					type: "error",
					confirmButtonText: "Close"
				});
			}
		);
	};

	$scope.initApp = function(){
		$scope.clearCurrentTree();
		biermanRest.loadTopology(
			// topology loaded successfully
			function(data){
				$scope.processTopologyData(data);
				$scope.topoInitialized = true;
				$scope.appConfig.currentTopologyId = data['topology-id'];
				$scope.getChannels();
				$scope.getPathList();
			},
			// topology load failed
			function(err){
				console.error(err);
				$scope.displayAlert({
				title: "App Initialization Failed",
				text: err.errMsg,
				type: "error",
				confirmButtonText: "Close"
			});
		});
	};

	$scope.computeMask = function(){
		$scope.currentTree.validStatus = 'inprogress'; // in progress
		$scope.processBierTreeData(
			// success callback
			function(input, spfMode){
				// save processed data
				$scope.currentTree.processedTree = input;
				biermanRest.computeMask(input,
					// success callback
					function(response){
						console.log(response);
						if(response.hasOwnProperty('fmask'))
						{
							$scope.currentTree.fmask = response.fmask;
							$scope.currentTree.validStatus = 'valid';
							if(spfMode){
								$scope.computedPaths = response['source-path'];
								var biLinks = $scope.convertUniToBiLinks(response['source-link'], true);
								$scope.highlightPath(biLinks);
							}
						}
						else{
							$scope.currentTree.fmask = '';
							$scope.currentTree.validStatus = 'invalid';
							var errMsg = 'Response from controller is invalid';
							console.error(errMsg);
							$scope.displayAlert({
								title: "Path Computation Failed",
								text: errMsg,
								type: "error",
								confirmButtonText: "Close"
							});
						}
					},
					// error callback
					function(errMsg){
						$scope.currentTree.fmask = '';
						$scope.currentTree.validStatus = 'invalid';
						console.error(errMsg);
						$scope.displayAlert({
							title: "Path Computation Failed",
							text: errMsg,
							type: "error",
							confirmButtonText: "Close"
						});

					}
				);
			},
			// error callback
			function(errMsg){
				$scope.currentTree.fmask = '';
				$scope.currentTree.validStatus = 'invalid';
				console.error(errMsg);
				$scope.displayAlert({
					title: "Path Computation Failed",
					text: errMsg,
					type: "error",
					confirmButtonText: "Close"
				});
			}
		);
	};

	$scope.deployPath = function(){
		var input;
		if($scope.currentTree.validStatus == 'valid'){
			$scope.currentTree.deploymentStatus = 'inprogress';
			console.log($scope.currentTree);

			input = $scope.currentTree.processedTree;
			input.input['channel-name'] = $scope.input.assignedChannel;

			if(!$scope.appConfig.spfMode){
				input.input['explicit-link'] = input.input['link'];
				delete input.input.link;
			}

			biermanRest.connectSource(
				input,
				// connectSource - success callback
				function(response){console.log(response);
					if(response.hasOwnProperty('source-path')){
						$scope.currentTree.deploymentStatus = 'failed';
						$scope.displayAlert({
							title: "Path Deployed",
							text: "You successfully deployed a path for " + input.input['channel-name'],
							type: "success",
							timer: 3000,
							confirmButtonText: "Awesome!"
						});
					}
					else{
						var errMsg = 'Invalid response from controller';
						$scope.currentTree.deploymentStatus = 'failed';
						console.error(errMsg, response);
						$scope.displayAlert({
							title: "Path Deployment Failed",
							text: errMsg,
							type: "error",
							confirmButtonText: "Close"
						});
					}
				},
				// connectSource - error callback
				function(err){
					$scope.currentTree.deploymentStatus = 'failed';
					console.error(err);
					$scope.displayAlert({
						title: "Path Deployment Failed",
						text: err.errMsg,
						type: "error",
						confirmButtonText: "Close"
					});
				}
			);

		}
		else{
			var errMsg = "Input data is invalid. Deployment of the path refused.";
			console.error(errMsg);
			$scope.displayAlert({
				title: "Could Not Deploy The Path",
				text: errMsg,
				type: "error",
				confirmButtonText: "Close"
			});
		}
		$scope.getPathList();
	};

	$scope.getPathList = function(){
		biermanRest.getPathList(
			$scope.appConfig.currentTopologyId,
			// getPathList - success callback
			function(pathList){
				$scope.pathData = pathList;
			},
			// getPathList - error callback
			function(err){
				console.error(err);
				$scope.displayAlert({
					title: "Path List Unavailable",
					text: err.errMsg,
					type: "error",
					confirmButtonText: "Close"
				});
			}
		)
	};

	$scope.processTopologyData = function(data){
		console.log('INITIAL TOPOLOGY DATA', data);

		function getKey(a, b){
			if(a < b)
				return a + '-' + b;
			else
				return b + '-' + a;
		}

		var topologyData = {
			nodes: [],
			links: [],
			// external id -> internal id
			nodesDict: new nx.data.Dictionary({}),
			linksDict: new nx.data.Dictionary({})
		};
		data.node.forEach(function(currentNode,index,nodes){
			// Reformat information
			var node = {};
			// Internal ID
			node.id = index;
			// Global ID
			node.nodeId = currentNode['node-id'];
			// BFR local id
			node.bfrLocalId = currentNode['topology-bier:bfr-local-id'];
			// Router ID
			node.routerId = currentNode['topology-bier:router-id'];
			// Termination points information
			node.tp = currentNode['termination-point'];
			// Attributes
			node.attributes = currentNode['l3-unicast-igp-topology:igp-node-attributes'];
			// fixme: ideally it should come from controller
			node.longitude = -149.8286774;
			node.latitude = 63.391326;
			node.x =  -1021.91217850693;
			node.y =  550.31264292335;
			// Assign node's external id to the internal one
			topologyData.nodesDict.setItem(node.nodeId, node.id);
			// Record node data
			topologyData.nodes.push(node);
		});



		for(var linkIndex = 0; linkIndex < data.link.length; linkIndex++){
			var srcId = topologyData.nodesDict.getItem(data.link[linkIndex].source['source-node']);
			var tarId = topologyData.nodesDict.getItem(data.link[linkIndex].destination['dest-node']);
			var currentLinkKey = getKey(srcId,tarId);
			var currentLink = data.link[linkIndex];
			var linkContainer = {};
			var linkContainerIndex = null;
			var linkInfo;


			if(topologyData.linksDict.contains(currentLinkKey)){
				linkContainerIndex = topologyData.linksDict.getItem(getKey(srcId,tarId));
			}
			else {
				linkContainerIndex = topologyData.links.length;
				topologyData.linksDict.setItem(getKey(srcId,tarId), linkContainerIndex);
				topologyData.links.push({
					id: linkContainerIndex,
					source: Math.min(srcId, tarId),
					target: Math.max(srcId, tarId),
					links: []
				});
			}

			linkContainer = topologyData.links[linkContainerIndex];

			linkInfo = {
				// Internal ID
				id: linkIndex,
				// Global ID
				linkId: currentLink['link-id'],
				// Source node ID
				source: topologyData.nodesDict.getItem(currentLink['source']['source-node']),
				// Target node ID
				target: topologyData.nodesDict.getItem(currentLink['destination']['dest-node']),
				// Source TP name
				sourceTP: currentLink['source']['source-tp'],
				// Target TP name
				targetTP: currentLink['destination']['dest-tp'],
				// BFR adjustment ID
				bfrAdjId: currentLink['topology-bier:bfr-adj-id'],
				// Delay of a link
				delay: currentLink['topology-bier:delay'],
				// Loss info
				loss: currentLink['topology-bier:loss'],
				// Attributes
				attributes: currentLink['l3-unicast-igp-topology:igp-link-attributes']
			};

			linkContainer.links.push(linkInfo);
		}

		$scope.topologyData = topologyData;
		console.log('TOPOLOGY DATA', $scope.topologyData);
		return $scope.topologyData;
	};

	$scope.clearTopology = function(){
		$scope.clearCurrentTree();
		$scope.resetTopology();
		$scope.appConfig.mode = 'start';
	};

	$scope.initApp();

	$scope.$watch('currentTree.validStatus', function(){
		var deployButtonTE = $('#deploy-button-te');
		var deployButtonSPF = $('#deploy-button-spf');
		switch($scope.currentTree.validStatus){
			case 'valid':
				deployButtonTE.prop('disabled', false);
				deployButtonSPF.prop('disabled', false);
				break;
			default:
				$scope.computedPaths = [];
				deployButtonTE.prop('disabled', true);
				deployButtonSPF.prop('disabled', true);
				$scope.currentTree.deploymentStatus = 'none';
				break;
		}
	});

	$scope.openRightPanel = function(panelCode){
		$scope.appConfig.currentPanel = panelCode;
		$mdSidenav('right').open();
	};

	$scope.openChannelManager = function() {
		$scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
		$mdDialog.show({
				controller: function($scope, $mdDialog, dScope){

					$scope.edit = {
						name: '',
						editing: false
					};
					$scope.input = {
						'addChannel': {},
						'addChannelStatus': 'none'
					};


					// Hide dialog (close without discarding changes)
					$scope.hide = function() {
						$mdDialog.hide();
					};
					// Cancel (discard changes)
					$scope.cancel = function() {
						$mdDialog.cancel();
					};
					$scope.typeOf = function(val){
						return typeof val;
					};
					$scope.editChannel = function(val){

					};
					$scope.removeChannel = function(chName){
						biermanRest.removeChannel(
							{
								topologyId: dScope.appConfig.currentTopologyId,
								channelName: chName
							},
							function(){
								dScope.getChannels();
								dScope.displayAlert({
									title: "Channel Removed",
									text: "The channel " + chName + " has been removed",
									type: "success",
									timer: 1500,
									confirmButtonText: "Okay"
								});
							},
								//
							function(err){
								console.error(err);
								dScope.displayAlert({
									title: "Channel Not Removed",
									text: err.errMsg,
									type: "error",
									confirmButtonText: "Close"
								});
							});
					};
					$scope.addChannel = function(){
						$scope.input.addChannelStatus = 'inprogress';
						if(biermanTools.hasOwnProperties($scope.input.addChannel, ['name', 'srcIP', 'destGroup', 'subdomain'])){
							var channelName = $scope.input.addChannel.name;
							biermanRest.addChannel(
								{
									'topo-id': dScope.appConfig.currentTopologyId,
									'channel-name': channelName,
									'src-ip': $scope.input.addChannel.srcIP,
									'dst-group': $scope.input.addChannel.destGroup,
									'sub-domain': $scope.input.addChannel.subdomain
								},
								// success
								function(data){
									$scope.input.addChannel = {};
									$scope.input.addChannelStatus = 'success';
									dScope.getChannels();
									dScope.displayAlert({
										title: "Channel Added",
										text: "The channel " + channelName + " has been added to the system",
										type: "success",
										timer: 1500,
										confirmButtonText: "Okay"
									});
								},
								// error
								function(err){
									console.error(err);
									dScope.displayAlert({
										title: "Channel Not Added",
										text: err.errMsg,
										type: "error",
										confirmButtonText: "Close"
									});
								}
							);
						}
						else{
							var errMsg = "Failed to create a channel. You must specify each parameter.";
							dScope.displayAlert({
								title: "Channel Not Added",
								text: errMsg,
								type: "error",
								confirmButtonText: "Close"
							});
						}
					};
					$scope.dScope = dScope;
				},
				templateUrl: './app/templates/channel-manager.tpl.html',
				parent: angular.element(document.body),
				clickOutsideToClose: true,
				fullscreen: useFullScreen,
				locals: {
					dScope: $scope
				}
			})
			.then(function(answer) {
				$scope.status = 'You said the information was "' + answer + '".';
			}, function() {
				$scope.status = 'You cancelled the dialog.';
			});
		$scope.$watch(function() {
			return $mdMedia('xs') || $mdMedia('sm');
		}, function(wantsFullScreen) {
			$scope.customFullscreen = (wantsFullScreen === true);
		});
	};
});