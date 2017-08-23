# tile-map-editor
An HTML5 online tile map editor. The map data can be exported in JSON format.

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
```javascript
var mapSettings = {
    tileSize: [64, 32], // width, height in pixel.
    mapSize: [8, 8],    // rows and columns.
    isometric: true     // build isometric map.
};
  
var map = new TileMap.Map(document.getElementById("canvas"), mapSettings);
```

### Step 3 - Configure map assets
```javascript
// Configure ground assets
map.groundAssetURLs = {
    "grass": "assets/ground/isometric/tile_grass_64x32.png"
};

// Configure height assets
map.heightAssetURLs = {
    "tree01": "assets/height/isometric/tile_tree01_64.png",
    "tree02": "assets/height/isometric/tile_tree02_64.png"
};
```
