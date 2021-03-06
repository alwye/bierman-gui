app.directive('biermanTopology', function() {
	return {
		'restrict': 'E',
		'template': '',
		'scope': {
			'topologyStartOver': '=',
			'topoInitialized': '=',
			'topo': '=',
			'openPanel': '=',
			'processBierTreeData': '=',
			'resetTopology': '=',
			'highlightPath': '=',
			'convertUniToBiLinks': '='
		},
		'link': function($scope, iElm, iAttrs, controller){
			var initTopology = function(){

				$scope.dumpData = null;

				$scope.colorTable = {
					'nodeTypes': {
						'ingress': '#009933',
						'egress': '#0033cc',
						'none': '#0591D9'
					},
					'linkTypes': {
						'path': '#009933',
						'none': '#67C9E4'
					}
				};

				$scope.processBierTreeData = function(successCbk, errorCbk){
					var tree = $scope.$parent.currentTree;
					var ingress = $scope.topo.getNode(tree.ingress);
					var input;
					var nodeHistory = [];
					var loop = false;
					var errMsg;

					var getConnectedLinks = function(nodeId, parentId){
						if(loop) return false;
						nodeHistory.push(parentId);
						var node = $scope.topo.getNode(nodeId);
						node.eachLink(function(link, linkId){
							if(tree.links.indexOf(link.id()) != -1 && !loop){
								var connectedNode = -1;
								// find a connected node's ID
								if(link.model().sourceID() == node.id()){
									connectedNode = link.model().targetID();
								}
								else if(link.model().targetID() == node.id()){
									connectedNode = link.model().sourceID();
								}
								// if not a parent
								if(connectedNode != parentId){
									if(nodeHistory.indexOf(connectedNode) == -1)
									{
										// find a correct link id
										for(var i = 0; i < link.model()._data.links.length; i++){
											if(link.model()._data.links[i].target == connectedNode){
												input.input.link.push({
													'link': link.model()._data.links[i].linkId
												});
												break;
											}
										}
										if(!getConnectedLinks(connectedNode, nodeId))
											return false;
									}
									else{
										loop = true;
										var errMsg = 'Loop at node ' + $scope.topo.getNode(connectedNode).model()._data.attributes.name + ' has been detected';
										errorCbk(errMsg);
										return false;
									}
								}
							}
						});
						return !loop;
					};

					// if a tree's ready
					if($scope.$parent.appConfig.currentTopologyId && ingress != undefined && ingress != null){
						// SPF
						if($scope.$parent.appConfig.spfMode)
						{
							if(tree.egress.length != 0){
								input = {
									'input': {
										'topo-id': $scope.$parent.appConfig.currentTopologyId,
										'node-id': ingress.model()._data.nodeId,
										'egress-node': []
									}
								};

								input.input['egress-node'] = tree.egress.map(function(egressId){
									var egress = $scope.topo.getNode(egressId);
									return {
										'node': egress.model()._data.nodeId
									};
								});
								successCbk(input, true);
							}
							else{
								errMsg = 'You must specify the egress nodes for SPF configuration of BIER tree..';
								errorCbk(errMsg);
							}

						}
						// manual
						else {
							if(tree.links.length != 0){
								input = {
									'input': {
										'topo-id': $scope.$parent.appConfig.currentTopologyId,
										'node-id': ingress.model()._data.nodeId,
										'link': []
									}
								};
								if(getConnectedLinks(ingress.id(), -1))
									successCbk(input, false);
							}
							else{
								errMsg = 'You must specify the links for manual configuration of BIER tree..';
								errorCbk(errMsg);
							}
						}

					}
					else{
						errMsg = 'BIER tree was not set properly. Try again.';
						errorCbk(errMsg);
					}
				};

				$scope.openPanel = function(panelCode, auxParam){
					var topoDiv = $('#bierman-topology');
					var previousPanelType = $scope.$parent.appConfig.currentPanel;
					$scope.topo.adaptToContainer();
					$scope.topo.fit();
					$scope.topo.resize(topoDiv.innerWidth, topoDiv.innerHeight);
					/*
					$scope.$parent.appConfig.currentPanel = panelCode;
					$scope.fadeInAllLayers();
					if (panel.hasClass('visible') && previousPanelType == panelCode) { //user attempts to close slide-out
						$scope.topo.getLayer('nodes').highlightedElements().clear(); //clears anything left highlighted
						$scope.topo.getLayer('links').highlightedElements().clear();

						panel.removeClass('visible').animate({'margin-right':'-400px'}); //shift slidepanel
						$('div').find('.in').removeClass('in');
						$scope.topo.adaptToContainer(); //fix topo size
					} else {
						panel.addClass('visible').animate({'margin-right': '0px'}); //shifts slidepanel
						$scope.topo.resize((window.innerWidth - 200), 0.975 * (window.innerHeight)); //resize topology
						$scope.topo.fit(); //fits to view
					}
					*/
				};

				// Dump the positions of nodes
				$scope.writeDumpdata = function(){
					$scope.dumpData = {'nodes': []};
					var nodesLayer = $scope.topo.getLayer('nodes');
					nodesLayer.eachNode(function(node){
						// geo layput
						if($scope.topo.layoutType() == 'USMap'){
							$scope.dumpData.nodes.push({
								//'x': node.x(),
								//'y': node.y(),
								'longitude': node.model()._data.longitude,
								'latitude': node.model()._data.latitude,
								'nodeName': node.model()._data['nodeId']
							});
						}
						// no geo layout
						else{
							$scope.dumpData.nodes.push({
								'x': node.x(),
								'y': node.y(),
								'nodeName': node.model()._data['nodeId']
							});
						}

					});
					$scope.$parent.topologySaveGeoLocation(
						$scope.dumpData,
						function(data){},
						function(err){
							console.info(err);
							$scope.$parent.displayAlert({
								title: "Can't save geo-location data",
								text: err.errMsg,
								type: "warning",
								confirmButtonText: "Close"
							});
						}
					);
				};

				// highlights a node
				$scope.highlightNode = function (targetId, noLinks) {
					var nodeLayer = $scope.topo.getLayer('nodes');
					var linksLayer = $scope.topo.getLayer('links');
					var linksLayerHighlightElements = linksLayer.highlightedElements();
					var nodeLayerHighlightElements = nodeLayer.highlightedElements();

					noLinks = noLinks || false;
					//Clears previous
					nodeLayerHighlightElements.clear();
					linksLayerHighlightElements.clear();

					//highlight nodes
					nodeLayerHighlightElements.add($scope.topo.getNode(targetId));
					if (!noLinks) {
						//highlight links
						linksLayerHighlightElements.addRange(nx.util.values($scope.topo.getNode(targetId).links()));
					}
					else {
						linksLayer.fadeOut(true);
					}
				};

				$scope.convertUniToBiLinks = function(uniLinks, clearLinks){
					clearLinks = clearLinks || false;
					var biLinks = [];
					var linksLayer = $scope.topo.getLayer('links');
					linksLayer.eachLink(function(link){
						var linkContainer = link.model()._data.links;
						for(var i = 0; i < uniLinks.length; i++){
							for(var j = 0; j < linkContainer.length; j++){
								if(uniLinks[i].link == linkContainer[j].linkId){
									biLinks.push(link.id());
								}
							}
						}
						if(clearLinks)
							link.color($scope.colorTable.linkTypes.none);
					});
					return biLinks;
				};

				$scope.highlightPath = function(links){
					links.forEach(function(linkId){
						var link = $scope.topo.getLink(linkId);
						link.color($scope.colorTable.linkTypes.path);
					});
				};

				$scope.resetTopology = function () {
					$scope.applyChanges();
				};

				// highlights a link
				$scope.highlightLink = function (linkId) {
					var nodeLayer = $scope.topo.getLayer('nodes');
					var linksLayer = $scope.topo.getLayer('links');
					var linksLayerHighlightElements = linksLayer.highlightedElements();
					var nodeLayerHighlightElements = nodeLayer.highlightedElements();
					var link = $scope.topo.getLink(linkId);

					//Clears previous
					nodeLayerHighlightElements.clear();
					linksLayerHighlightElements.clear();

					//highlight link
					linksLayerHighlightElements.add(link);
					//highlight connected nodes
					nodeLayerHighlightElements.addRange(nx.util.values({
						source: $scope.topo.getNode(link.model().sourceID()),
						target: $scope.topo.getNode(link.model().targetID())
					}));
				};

				// completely clear all paths from path layer
				$scope.clearPathLayer = function () {
					var pathLayer = $scope.topo.getLayer("paths");
					pathLayer.clear();
					return pathLayer;
				};

				$scope.getNodeTypeById = function (id) {
					if ($scope.$parent.currentTree.ingress == id)
						return 'ingress';
					else if ($scope.$parent.currentTree.egress.indexOf(id) != -1)
						return 'egress';
					else
						return 'none';
				};

				$scope.getLinkTypeById = function (id) {
					if ($scope.$parent.currentTree.links.indexOf(id) != -1)
						return 'path';
					else
						return 'none';
				};

				$scope.fadeInAllLayers = function () {
					//fade out all layers
					nx.each($scope.topo.layers(), function (layer) {
						layer.fadeIn(true);
					}, this);
				};

				$scope.fadeOutAllLayers = function () {
					//fade out all layers
					nx.each($scope.topo.layers(), function (layer) {
						layer.fadeOut(true);
					}, this);
				};

				$scope.applyChanges = function () {
					var nodes = $scope.topo.getLayer('nodes');
					var links = $scope.topo.getLayer('links');
					// apply changes to nodes
					nodes.eachNode(function (node) {
						node.applyChanges();
					});
					// apply changes to links
					links.eachLink(function (link) {
						link.applyChanges();
					});
				};

				$scope.pickNode = function (id) {
					// select source
					if ($scope.$parent.appConfig.mode == 'start') {
						$scope.$parent.currentTree.ingress = id;
						$scope.$parent.appConfig.mode = 'draw';
					}
					// select receivers
					else if ($scope.$parent.appConfig.mode == 'draw') {
						var nodeIndex = $scope.$parent.currentTree.egress.indexOf(id);
						// if node is not used
						if (nodeIndex == -1 && id != $scope.$parent.currentTree.ingress)
							$scope.$parent.currentTree.egress.push(id);
						// if node is ingress
						else if(id == $scope.$parent.currentTree.ingress){
							$scope.$parent.currentTree.ingress = null;
							$scope.$parent.appConfig.mode = 'start';
						}
						// if the node is egress
						else if(nodeIndex > -1){
							$scope.$parent.currentTree.egress.splice(nodeIndex, 1);
							console.log()
						}
					}
					$scope.$parent.currentTree.validStatus = 'none';
					$scope.$apply();
					$scope.applyChanges();
				};

				$scope.pickLink = function (id) {
					if ($scope.$parent.appConfig.mode == 'draw') {
						var indexOfLink = $scope.$parent.currentTree.links.indexOf(id);
						if ($scope.$parent.currentTree.links.indexOf(id) == -1) {
							$scope.$parent.currentTree.links.push(id);
						}
						else {
							$scope.$parent.currentTree.links.splice(indexOfLink, 1);
						}
						$scope.$parent.currentTree.validStatus = 'none';
						$scope.$apply();
						$scope.applyChanges();
					}
				};

				nx.define('CustomScene', nx.graphic.Topology.DefaultScene, {
					'methods': {
						clickNode: function (topology, node){
							$scope.pickNode(node.id());
						},
						clickLink: function (topology, link){
							$scope.pickLink(link.id());
						}
					}
				});

				nx.define('ExtendedNode', nx.graphic.Topology.Node, {
					'methods': {
						'init': function (args) {
							this.inherited(args);
							var stageScale = this.topology().stageScale();
							this.view('label').setStyle('font-size', 14 * stageScale);
						},
						'setModel': function (model) {
							this.inherited(model);
						},
						'applyChanges': function () {
							var type = $scope.getNodeTypeById(this.id());
							if ($scope.colorTable.nodeTypes.hasOwnProperty(type)) {
								this.color($scope.colorTable.nodeTypes[type]);
							}
						}
					}
				});

				nx.define('ExtendedLink', nx.graphic.Topology.Link, {
					'methods': {
						'init': function (args) {
							this.inherited(args);
							// fixme: third parameter should be false
							$scope.topo.fit(undefined, undefined, true);
						},
						'setModel': function (model) {
							this.inherited(model);
						},
						'applyChanges': function () {
							var type = $scope.getLinkTypeById(this.id());
							if ($scope.colorTable.linkTypes.hasOwnProperty(type)) {
								this.color($scope.colorTable.linkTypes[type]);
							}
						}
					}
				});

				$scope.topo = new nx.graphic.Topology({
					'adaptive': true,
					'scalable': true,
					'showIcon': true,
					'nodeConfig': {
						'label': 'model.attributes.name',
						'iconType': 'router',
						'color': $scope.colorTable.nodeTypes.none
					},
					'linkConfig': {
						'linkType': 'curve',
						'width': 5,
						'color': $scope.colorTable.linkTypes.none
					},
					'identityKey': 'id',
					'enableSmartLabel': true,
					'enableSmartNode': true,
					'enableGradualScaling': true,
					'supportMultipleLink': true,
					'dataProcessor': 'force',
					'autoLayout': true,
					'nodeInstanceClass': 'ExtendedNode',
					'linkInstanceClass': 'ExtendedLink',
					'layoutType': 'USMap',
					'layoutConfig': {
						'longitude': 'model._data.longitude',
						'latitude': 'model._data.latitude'
					}
				});

				$scope.topo.data($scope.$parent.topologyData);

				// fired when topology is generated
				$scope.topo.on('topologyGenerated', function (sender, event){
					// use custom events for the topology
					sender.registerScene('ce', 'CustomScene');
					sender.activateScene('ce');
					// disable tooltips for both nodes and links
					$scope.topo.tooltipManager().showNodeTooltip(false);
					$scope.topo.tooltipManager().showLinkTooltip(false);
					$scope.topo.adaptToContainer();
				});

				$scope.topo.on('ready', function(){
					// hide native NeXt's spinner
					$scope.topo.hideLoading();
					window.setInterval(function(){$scope.writeDumpdata();}, 5000);
				});

				$scope.topo.on('fitStage', function(sender, event){
					setTimeout(function(){
						if($scope.$parent.appConfig.mode == 'init'){
							$scope.$parent.appConfig.mode = 'start';
							$scope.$apply();
						}
					},1000);
				});

				var app = new nx.ui.Application();
				app.container(document.getElementById('bierman-topology'));
				app.on('resize', function () {
					$scope.topo.adaptToContainer();
				});
				$scope.topo.attach(app);
			};

			$scope.$watch('$parent.topologyData', function(){
				if($scope.$parent.topologyData.nodes.length && $scope.$parent.topoInitialized === true) {
					initTopology($scope.$parent.topologyData);
				}
			});

		}
	};
});