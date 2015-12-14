var topologyData = {
	nodes: [
		{"id": 0, "x": 100, "y": 100, "name": "Router 1"},
		{"id": 1, "x": 200, "y": 100, "name": "Router 2"},
		{"id": 2, "x": 300, "y": 100, "name": "Router 3"},
		{"id": 3, "x": 400, "y": 100, "name": "Router 4"},
		{"id": 4, "x": 100, "y": 200, "name": "Router 5"},
		{"id": 5, "x": 200, "y": 200, "name": "Router 6"},
		{"id": 6, "x": 300, "y": 200, "name": "Router 7"},
		{"id": 7, "x": 400, "y": 200, "name": "Router 8"},
		{"id": 8, "x": 100, "y": 300, "name": "Router 9"},
		{"id": 9, "x": 200, "y": 300, "name": "Router 10"},
		{"id": 10, "x": 300, "y": 300, "name": "Router 11"},
		{"id": 11, "x": 400, "y": 300, "name": "Router 12"}
	],
	links: [
		{"source": 0, "target": 1},
		{"source": 1, "target": 2},
		{"source": 2, "target": 3},
		{"source": 4, "target": 5},
		{"source": 5, "target": 6},
		{"source": 6, "target": 7},
		{"source": 8, "target": 9},
		{"source": 9, "target": 10},
		{"source": 10, "target": 11},

		{"source": 0, "target": 4},
		{"source": 4, "target": 8},
		{"source": 1, "target": 5},
		{"source": 5, "target": 9},
		{"source": 2, "target": 6},
		{"source": 6, "target": 10},
		{"source": 3, "target": 7},
		{"source": 7, "target": 11}
	]
};