app.directive('biermanTopology', function() {
	return {
		'restrict': 'E',
		'template': '<div id="bierman-topology"></div>',
		'scope': {
			'topologyStartOver': '=',
			'topoInitialized': '=',
			'topo': '='
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

				// reads data from local storage
				$scope.readDumpDataFromLocalStorage = function(){
					try{
						$scope.dumpData = JSON.parse(localStorage.getItem("biermanTopologyData"));
					}catch(e) {
						console.info('Local Storage read parse error:', e);
					}
					$scope.readDumpData();
				};

				// saves the data to local storage
				$scope.writeDumpDataToLocalStorage = function(){
					try{
						localStorage.setItem("biermanTopologyData", JSON.stringify($scope.dumpData));
					}catch(e) {
						console.info('Local Storage save error:', e);
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
						$scope.$apply();
					}
					// select receivers
					else if ($scope.$parent.appConfig.mode == 'draw') {
						if ($scope.$parent.currentTree.egress.indexOf(id) == -1
							&& id != $scope.$parent.currentTree.ingress)
							$scope.$parent.currentTree.egress.push(id);
						$scope.$apply();
					}
					$scope.applyChanges();
				};

				$scope.pickLink = function (id) {
					if ($scope.$parent.appConfig.mode == 'draw') {
						var indexOfLink = $scope.$parent.currentTree.links.indexOf(id);
						if ($scope.$parent.currentTree.links.indexOf(id) == -1) {
							$scope.$parent.currentTree.links.push(id);
							$scope.$apply();
							$scope.applyChanges();
						}
						else {
							$scope.$parent.currentTree.links.splice(indexOfLink, 1);
							$scope.$apply();
							$scope.applyChanges();
						}
					}
				};

				nx.define('CustomScene', nx.graphic.Topology.DefaultScene, {
					'methods': {
						clickNode: function (topology, node) {
							console.log(node);
							$scope.pickNode(node.id());
						},
						clickLink: function (topology, link) {
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
							$scope.topo.fit();
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