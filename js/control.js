(function(nx){

	nx.define('ControlPanel', nx.ui.Component, {
		'view': {
			'content': [
				{
					'tag': 'button',
					'content': 'Start Over',
					'events': {
						'click': '{#reset}'
					}
				}
			]
		},
		'methods': {
			'reset': function(){

			}
		}
	});

})(nx);