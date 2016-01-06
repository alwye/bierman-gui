app.controller('biermanCtrl', function($scope, BiermanRest) {

	// BIER Manager configuration
	$scope.appConfig = {
		// FOR MANUAL CONFIGURATION
		'ctrlHost': '10.124.19.145', // IP address of controller
		'ctrlPort': '8181', // Port of controller (8181 by default)
		'ctrlUsername': 'admin', // Username for controller
		'ctrlPassword': 'admin', // Password for user
		'httpMaxTimeout': 10000, // Maximum timeout in milliseconds for HTTP requests
		// DO NOT MODIFY CONFIGURATION BELOW
		'mode': 'init', // Application mode (do not modify)
		'topoInitialized': false
	};

	var biermanRest = new BiermanRest($scope.appConfig);

	// Topology data in Common Topology Model style
	$scope.topologyData = {
		'nodes': [],
		'links': []
	};

	$scope.clearCurrentTree = function(){
		$scope.currentTree = {
			'ingress': null,
			'egress': [],
			'links': []
		};
	};

	$scope.initApp = function(){
		$scope.clearCurrentTree();
		biermanRest.loadTopology(function(data){
			$scope.appConfig.mode = 'start';
			$scope.processTopologyData(data);
			$scope.topoInitialized = true;
			console.log($scope.topologyData);
		}, function(errMsg){
			console.error(errMsg);
		});

	};

	$scope.selectPath = function(){
		$scope.appConfig.mode = 'draw';
	};

	$scope.validateTree = function(){
		alert('not ready yet');
	};

	$scope.processTopologyData = function(data){
		console.log(data);
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

			// Assign node's external id to the internal one
			topologyData.nodesDict.setItem(node.nodeId, node.id);
			// Record node data
			topologyData.nodes.push(node);
		});

		data.link.forEach(function(currentLink,index,links){
			// Reformat information
			var link = {};
			// Internal ID
			link.id = index;
			// Global ID
			link.linkId = currentLink['link-id'];
			// Source node ID
			link.source = topologyData.nodesDict.getItem(currentLink['source']['source-node']);
			// Target node ID
			link.target = topologyData.nodesDict.getItem(currentLink['destination']['dest-node']);
			// Source TP name
			link.sourceTP = currentLink['source']['source-tp'];
			// Target TP name
			link.targetTP = currentLink['destination']['dest-tp'];
			// BFR adjustment ID
			link.bfrAdjId = currentLink['topology-bier:bfr-adj-id'];
			// Delay of a link
			link.delay = currentLink['topology-bier:delay'];
			// Loss info
			link.loss = currentLink['topology-bier:loss'];
			// Attributes
			link.attributes = currentLink['l3-unicast-igp-topology:igp-link-attributes'];

			// Assign link's external id to the internal one
			topologyData.linksDict.setItem(link.linkId, link.id);
			// Record link data
			topologyData.links.push(link);
		});

		$scope.topologyData = topologyData;
		return $scope.topologyData;
	};

	$scope.initApp();
});