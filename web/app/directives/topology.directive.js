app.directive('biermanTopology', function() {
	return {
		'restrict': 'E',
		'template': '<div id="bierman-topology"></div>',
		'scope': {
			'topologyStartOver': '=',
			'topoInitialized': '=',
			'topo': '=',
			'openPanel': '=',
			'processBierTreeData': '=',
			'resetTopology': '='
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

				// todo: catch loops
				$scope.processBierTreeData = function(successCbk, errorCbk){
					var tree = $scope.$parent.currentTree;
					var ingress = $scope.topo.getNode(tree.ingress);
					var input;
					var nodeHistory = [];
					var loop = false;

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
					if($scope.$parent.appConfig.currentTopologyId && ingress != undefined && ingress != null && tree.links.length > 0){
						input = {
							'input': {
								'topo-id': $scope.$parent.appConfig.currentTopologyId,
								'node-id': ingress.model()._data.nodeId,
								'link': []
							}
						};
						if(getConnectedLinks(ingress.id(), -1))
							successCbk(input);
					}
					else{
						var errMsg = 'BIER tree was not set properly. Try again.';
						errorCbk(errMsg);
					}
				};

				$scope.openPanel = function(panelCode, auxParam){
					var panel = $('#side-panel');
					var previousPanelType = $scope.$parent.appConfig.currentPanel;
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
				};

				// reads data from local storage
				$scope.readDumpDataFromLocalStorage = function(){
					try{
						$scope.dumpData = JSON.parse(localStorage.getItem("biermanTopologyData"));
					}catch(e) {
						var errMsg = 'Could not read saved layout from local storage';
						console.info(errMsg, e);
						swal({
							title: "FMASK Computation Failed",
							text: errMsg,
							type: "warning",
							confirmButtonText: "Close"
						});
					}
					$scope.readDumpData();
				};

				// saves the data to local storage
				$scope.writeDumpDataToLocalStorage = function(){
					try{
						localStorage.setItem("biermanTopologyData", JSON.stringify($scope.dumpData));
					}catch(e) {
						var errMsg = 'Could not save layout to local storage';
						console.info(errMsg, e);
						swal({
							title: "FMASK Computation Failed",
							text: errMsg,
							type: "warning",
							confirmButtonText: "Close"
						});
					}
				};

				// Dump the positions of nodes
				$scope.writeDumpdata = function(){
					$scope.dumpData = {'nodes': []};
					var nodesLayer = $scope.topo.getLayer('nodes');
					nodesLayer.eachNode(function(node){
						$scope.dumpData.nodes.push({
							'x': node.x(),
							'y': node.y(),
							'nodeName': node.model()._data['nodeId']
						});
					});
					$scope.writeDumpDataToLocalStorage();
				};

				// read dump data from $scope.dumpData
				$scope.readDumpData = function(){
					if($scope.dumpData && $scope.dumpData.nodes ){
						$scope.dumpData.nodes.forEach(function(node, index, nodes){
							nodeInst = $scope.topo.getNode($scope.$parent.topologyData.nodesDict.getItem(node.nodeName));
							if(nodeInst != undefined)
								nodeInst.position({'x': node.x, 'y': node.y});
						});
					}
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

				// draws a path over topology for the defined array of links
				$scope.highlightPath = function (links, color) {
					// clear the path layer and get its instance
					var pathLayer = $scope.clearPathLayer();
					// define a path
					var path = new nx.graphic.Topology.Path({
						'pathWidth': 5,
						'links': links,
						'arrow': 'cap'
					});
					// add the path
					pathLayer.addPath(path);
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
						if ($scope.$parent.currentTree.egress.indexOf(id) == -1
							&& id != $scope.$parent.currentTree.ingress)
							$scope.$parent.currentTree.egress.push(id);
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
					nodeSetConfig: {
						'iconType': 'accessPoint'
					},
					'identityKey': 'id',
					'width': 1000,
					'height': 800,
					'enableSmartLabel': true,
					'enableSmartNode': true,
					'enableGradualScaling': true,
					'supportMultipleLink': true,
					'dataProcessor': 'force',
					'nodeInstanceClass': 'ExtendedNode',
					'linkInstanceClass': 'ExtendedLink'
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
				});

				$scope.topo.on('ready', function(sender, event){
					$scope.readDumpDataFromLocalStorage();
					window.setInterval(function(){$scope.writeDumpdata();}, 5000);

				});

				$scope.topo.on('fitStage', function(sender, event){
					setTimeout(function(){
						$scope.$parent.appConfig.mode = 'start';
						$scope.$apply();
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