# tile-map-editor
An HTML5 online tile map editor. The map data can be exported in JSON format.

Live demo to visit https://less-xx.github.io/tile-map-editor/

<img src="https://user-images.githubusercontent.com/742769/29623655-a81fc21e-8859-11e7-887b-b0a07c9904a1.png" width="160">


## Build
`npm run build` to build unified and minified script.


## Usage
### Step 1 - Setup
Add tile-map.js in you html file.
```javascript
<script type="text/javascript" src="tile-map.js"></script>
```
Then add a <canvas> element.
```html
<canvas id="canvas" style="position:absolute; width:800px; height:600px;"></canvas>
```

### Step 2 - Create map object
It's very easy to create a new map.
```javascript
var mapSettings = {
    tileSize: [64, 32], // width, height in pixel.
    mapSize: [8, 8],    // rows and columns.
    isometric: true     // build isometric map.
};
  
var map = new TileMap.Map(document.getElementById("canvas"), mapSettings);
map.draw();
```
Or you can create map from JSON data (see below format)
```javascript
var map = TileMap.Map.build(document.getElementById("canvas"), sampleMapData);
```

### Step 3 - Add map assets
You can paint the map with ground assets and height assets. Before you do so, you should add the assets to the map.

```javascript
// add ground assets
map.groundAssetURLs = [
    {id: "grass", url: "/dist/assets/ground/isometric/tile_grass_64x32.png"}
];

// add height assets
map.heightAssetURLs = [
    {id: "tree01", url: "/dist/assets/height/isometric/tile_tree01_64.png"},
    {id: "tree02", url: "/dist/assets/height/isometric/tile_tree02_64.png"}
];
```

## Map Control
### Switch between 'Edit' and 'Pan' modes
```javascript
map.mode = "pan";
// map.mode = "edit";
```
Under 'pan' mode, you can move the map on the canvas. Under 'edit' mode, you can change the ground or height asset of a tile.

### Programmatically move map
```javascript
map.dmove(dx, dy);
```
dx,dy are distance between current position and the target position.

### Change active asset
Under 'edit' mode, you can paint the map with the active asset. To make an asset active, you can
```javascript
/**
 * First parameter is asset type. The value can be either 'ground' or 'height'.
 * The second parameter is the id of the asset.
 */
var asset = map.assetByTypeAndId("height", "tree02"); // choose an asset.
map.activeAsset = asset; // make it active.
```

## Get map data
```javascript
var json = JSON.stringify(map.mapData)
```
The data format will be like below

```json
{
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
            "position": [0, 0],
            "center": {
                "x": 400,
                "y": 284
            },
            "asset": "grass01"
        }, {
            "position": [1, 0],
            "center": {
                "x": 368,
                "y": 300
            },
            "asset": "grass01"
        }, {
            "position": [1, 1],
            "center": {
                "x": 432,
                "y": 300
            },
            "asset": "grass01"
        }, {
            "position": [2, 0],
            "center": {
                "x": 400,
                "y": 316
            },
            "asset": "grass01"
        }],
        "type": "ground"
    }, {
        "assets": [{
            "id": "tree02",
            "url": "http://localhost:8000/dist/assets/height/isometric/tile_tree02_64.png"
        }],
        "tiles": [{
            "position": [0, 0],
            "center": {
                "x": 400,
                "y": 284
            },
            "asset": "tree02"
        }, {
            "position": [1, 0],
            "center": {
                "x": 368,
                "y": 300
            },
            "asset": "tree02"
        }, {
            "position": [1, 1],
            "center": {
                "x": 432,
                "y": 300
            },
            "asset": "tree02"
        }],
        "type": "height"
    }]
}
```