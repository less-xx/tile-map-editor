sampleMapData = {
    "settings": {
        "tileSize": [64, 32],
        "mapSize": [2, 2],
        "isometric": true
    },
    "layers": [{
        "assets": [{
            "id": "grass01",
            "url": "http://localhost:8000/dist/assets/ground/isometric/tile_grass01_64x32.png"
        }],
        "tiles": [{
            "id": "t0-0",
            "center": {
                "x": 400,
                "y": 284
            },
            "asset": "grass01"
        }, {
            "id": "t1-0",
            "center": {
                "x": 368,
                "y": 300
            },
            "asset": "grass01"
        }, {
            "id": "t1-1",
            "center": {
                "x": 432,
                "y": 300
            },
            "asset": "grass01"
        }, {
            "id": "t2-0",
            "center": {
                "x": 400,
                "y": 316
            },
            "asset": "grass01"
        }],
        "type": "ground"
    }, {
        "assets": [{
            "id": "tree01",
            "url": "http://localhost:8000/dist/assets/height/isometric/tile_tree01_64.png"
        }],
        "tiles": [{
            "id": "t1-1",
            "center": {
                "x": 432,
                "y": 300
            },
            "asset": "tree01"
        }],
        "type": "height"
    }]
}