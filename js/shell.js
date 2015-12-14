(function(nx){

	var app = new nx.ui.Application();

	nx.define('TopologyContainer', nx.ui.Component, {
		properties: {
			topology: {
				get: function () {
					return this.view('topology');
				}
			}
		},
		view: {
			content: [
				{
					'name': 'topology',
					'type': 'nx.graphic.Topology',
					'props': {
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
					}
				}
			]
		}
	});

	var topologyContainer = new TopologyContainer();
	var topo = topologyContainer.topology();
	topo.attach(app);
	app.container(document.getElementById('bier-topology'));

	topo.data(topologyData);
	topo.fit();

})(nx);