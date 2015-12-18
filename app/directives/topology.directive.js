app.directive('biermanTopology', function() {
	return {
		'restrict': 'E',
		'template': '<div id="bierman-topology"></div>',
		'scope': {
			'topologyStartOver': '='
		},
		'link': function($scope, iElm, iAttrs, controller){

			$scope.colorTable = {
				'nodeTypes': {
					'ingress': '#009933',
					'egress': '#0033cc'
				},
				'path': '#993300'
			};


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

			$scope.topologyStartOver = function(){
				$scope.applyChanges();
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

			$scope.getNodeTypeById = function(id){
				if($scope.$parent.currentTree.ingress == id)
					return 'ingress';
				else if($scope.$parent.currentTree.egress.indexOf(id) != -1)
					return 'egress';
				else
					return 'none';
			};

			$scope.fadeOutAllLayers = function(){
				//fade out all layers
				nx.each($scope.topo.layers(), function(layer) {
					layer.fadeOut(true);
				}, this);
			};

			$scope.applyChanges = function(){
				var nodes = $scope.topo.getLayer('nodes');
				var links = $scope.topo.getLayer('links');
				// apply changes to nodes
				nodes.eachNode(function(node){
					node.applyChanges();
				});
				// apply changes to links
				links.eachLink(function(link){
					link.applyChanges();
				});
			};

			nx.define('CustomScene', nx.graphic.Topology.DefaultScene, {
				'methods': {
					clickNode: function(sender, node){
						// select source
						if($scope.$parent.mode == 'ingress'){
							$scope.$parent.currentTree.ingress = node.id();
							$scope.$parent.mode = 'egress';
							$scope.$apply();
						}
						// select receivers
						else if($scope.$parent.mode == 'egress'){
							if($scope.$parent.currentTree.egress.indexOf(node.id()) == -1
								&& node.id() != $scope.$parent.currentTree.ingress)
									$scope.$parent.currentTree.egress.push(node.id());
							$scope.$apply();
						}
						$scope.applyChanges();
					},
					clickLink: function(sender, link){console.log($scope.topo.data());
						if($scope.$parent.mode == 'path'){

						}
					}
				}
			});

			nx.define('ExtendedNode', nx.graphic.Topology.Node, {
				'methods': {
					'init': function(args){
						this.inherited(args);
					},
					'setModel': function(model){
						this.inherited(model);
					},
					'applyChanges': function(){
						var type = $scope.getNodeTypeById(this.id());
						if($scope.colorTable.nodeTypes.hasOwnProperty(type))
							this.color($scope.colorTable.nodeTypes[type]);
					}
				}
			});

			nx.define('ExtendedLink', nx.graphic.Topology.Link, {
				'methods': {
					'init': function(args){
						this.inherited(args);
					},
					'setModel': function(model){
						this.inherited(model);
					},
					'applyChanges': function(){
						// todo: nothing
					}
				}
			});

			$scope.topo = new nx.graphic.Topology({
				'adaptive': true,
				'showIcon': true,
				'nodeConfig': {
					'label': 'model.name',
					'iconType': 'router',
					'color': '#0how00'
				},
				'linkConfig': {
					'linkType': 'curve',
					'width': 5
				},
				'identityKey': 'id',
				'width': 1000,
				'height': 800,
				'enableSmartLabel': true,
				'enableGradualScaling': true,
				'supportMultipleLink': true,
				'nodeInstanceClass': 'ExtendedNode',
				'linkInstanceClass': 'ExtendedLink'
			});

			$scope.topo.data(topologyData);


			// fired when topology is generated
			$scope.topo.on('topologyGenerated', function(sender, event) {
				// use custom events for the topology
				sender.registerScene('ce', 'CustomScene');
				sender.activateScene('ce');
				$scope.topo.tooltipManager().showNodeTooltip(false);
				$scope.$parent.topologyInit = true;
				$scope.$parent.startOver();
			});

			var app = new nx.ui.Application();
			app.container(document.getElementById('bierman-topology'));
			app.on('resize', function(){
				$scope.topo.adaptToContainer();
			});

			$scope.topo.attach(app);

		}
	};
});