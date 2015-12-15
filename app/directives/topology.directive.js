app.directive('biermanTopology', function() {
	return {
		restrict: 'E',
		scope: {},
		template: '<div id="bier-topology"></div>',
		link: function($scope, iElm, iAttrs, controller) {

			// highlights a node
			$scope.highlightNode = function(targetId, noLinks) {
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
				if(!noLinks) {
					//highlight links
					linksLayerHighlightElements.addRange(nx.util.values($scope.topo.getNode(targetId).links()));
				}
				else{
					linksLayer.fadeOut(true);
				}
			};

			// highlights a link
			$scope.highlightLink = function(linkId) {
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
				nodeLayerHighlightElements.addRange(nx.util.values({source: $scope.topo.getNode(link.model().sourceID()), target: $scope.topo.getNode(link.model().targetID())}));
			};

			// completely clear all paths from path layer
			$scope.clearPathLayer = function(){
				var pathLayer = $scope.topo.getLayer("paths");
				pathLayer.clear();
				return pathLayer;
			};

			// draws a path over topology for the defined array of links
			$scope.highlightPath = function(links,color){
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

			$scope.fadeInAllLayers = function(){
				//fade out all layers
				nx.each($scope.topo.layers(), function(layer) {
					layer.fadeIn(true);
				}, this);
			};

			$scope.fadeOutAllLayers = function(){
				//fade out all layers
				nx.each($scope.topo.layers(), function(layer) {
					layer.fadeOut(true);
				}, this);
			};

			// reads data from localStorage
			$scope.readDumpDataFromLocalStorage = function(){
				try {
					$scope.dumpData = JSON.parse(localStorage.getItem("verizonTopologyData"));
				} catch(e) {
					console.info('Local Storage read parse error:', e);
				}

				$scope.readDumpData();
			};

			// saves the data to localStorage
			$scope.writeDumpDataToLocalStorage = function(){
				try {
					localStorage.setItem("verizonTopologyData", JSON.stringify($scope.dumpData));
				} catch(e) {
					console.info('Local Storage save error:', e);
				}
			};

			// dump the positions of nodes
			$scope.writeDumpdata = function(){
				//var stageScale = $scope.topo.stageScale();
				$scope.dumpData = {'nodes': []};
				var nodesLayer = $scope.topo.getLayer('nodes');
				nodesLayer.eachNode(function(node){
					$scope.dumpData.nodes.push({
						'x': node.x(),
						'y': node.y(),
						'nodeName': node.model()._data['node-id']
					});
				});
				$scope.writeDumpDataToLocalStorage();
			};

			// read dump data from $scope.dumpData
			$scope.readDumpData = function(){
				if($scope.dumpData && $scope.dumpData.nodes ){
					$scope.dumpData.nodes.forEach(function(node, index, nodes){
						nodeInst = $scope.topo.getNode($scope.topologyData.nodesDict.getItem(node.nodeName));
						if(nodeInst != undefined)
							nodeInst.position({'x': node.x, 'y': node.y});
					});
				}
			};

			// todo: custom events
			nx.define('CustomScene', nx.graphic.Topology.DefaultScene, {
				methods: {
					clickNode: function(sender, node){

					},
					clickLink: function(sender, link){

					}
				}
			});

			nx.define('Topology', nx.graphic.Topology, {
								'adaptive': true,
								'showIcon': true,
								'nodeConfig': {
									'label': 'model.name',
									'iconType': 'router',
									'color': '#0how00'
								},
								'linkConfig': {
									'linkType': 'curve'
								},
								nodeSetConfig: {
									'label': 'model.label',
									'iconType': 'groupL'
								},
								'identityKey': 'id',
								'width': 800,
								'height': 400,
								'enableSmartLabel': true,
								'enableGradualScaling': true,
								'supportMultipleLink': true
							});


			$scope.topo = new Topology();

			$scope.topo.data(topologyData);


			// fired when topology is generated
			$scope.topo.on('topologyGenerated', function(sender, event) {
				// use custom events for the topology
				sender.registerScene('ce', 'CustomEvents');
				sender.activateScene('ce');
				$scope.topo.tooltipManager().showNodeTooltip(false);
			});

			// fired when the app is ready and displayed
			$scope.topo.on('ready', function(sender, event) {
				$scope.readDumpDataFromLocalStorage();
				// dump the data
				window.setInterval(function(){$scope.writeDumpdata();}, 5000);
			});

			var app = new nx.ui.Application();
			app.container(document.getElementById('bierman-topology'));
			app.on('resize', function(){
				$scope.topo.adaptToContainer();
			});

			$scope.topo.attach(app);
			topoInitialized = true;

		}
	};
});