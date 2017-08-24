module TileMap {

    declare interface ObjectConstructor {
        assign(...objects: Object[]): Object;
    }

    export enum MapMode {
        Pan = "pan",
        Edit = "edit"
    }

    export class Map {

        private _settings = {
            tileSize: [32, 32], //in pixel
            mapSize: [10, 10], //rows and columns
            isometric: false
        };
        private _canvas: HTMLCanvasElement;
        private _center: Point;
        private _context: CanvasRenderingContext2D;

        private _translate: Point = new Point(0, 0);
        private _isMouseDown: boolean = false;
        private _p1: Point;
        private _selectedAsset: Asset = null;
        private _groundLayer: TileLayer = null;
        private _heightLayer: TileLayer = null;
        private _maskLayer: MaskLayer = null;
        private _mode: MapMode = MapMode.Pan;

        private _mouseDownHandler: (e: MouseEvent) => void;
        private _mouseMoveHandler: (e: MouseEvent) => void;
        private _mouseUpHandler: (e: MouseEvent) => void;

        constructor(canvas: HTMLCanvasElement, settings: {}) {

            this._canvas = canvas;
            this._settings = (<any>Object).assign({}, settings);

            this._canvas.width = this._canvas.clientWidth * Util.devicePixelRatio;
            this._canvas.height = this._canvas.clientHeight * Util.devicePixelRatio;
            this._canvas.focus();
            this._context = this._canvas.getContext("2d");
            this._center = new Point(this._canvas.clientWidth / 2, this._canvas.clientHeight / 2);

            this._mouseDownHandler = (e: MouseEvent) => { this.mouseDown(e); };
            this._mouseMoveHandler = (e: MouseEvent) => { this.mouseMove(e); };
            this._mouseUpHandler = (e: MouseEvent) => { this.mouseUp(e); };
            this._canvas.addEventListener("mousedown", this._mouseDownHandler, false);
            this._canvas.addEventListener("mousemove", this._mouseMoveHandler, false);
            this._canvas.addEventListener("mouseup", this._mouseUpHandler, false);
        }

        public initialize() {
            this._groundLayer = this.createLayer(AssetType.Ground)
            this._heightLayer = this.createLayer(AssetType.Height)
            this._maskLayer = new MaskLayer(this._canvas.width, this._canvas.height);
        }

        private createLayer(assetType: AssetType, layerData?: LayerData): TileLayer {
            var w = this._settings.tileSize[0];
            var h = this._settings.tileSize[1];
            var layer = new TileLayer(this._canvas.width, this._canvas.height);
            if (layerData == null) {
                if (!this._settings.isometric) {
                    var tiles: { [id: string]: Tile } = {};
                    for (var row = 0; row < this._settings.mapSize[0]; row++) {
                        for (var col = 0; col < this._settings.mapSize[1]; col++) {
                            var centerX = this._center.x - (this._settings.mapSize[0] / 2 - col) * w;
                            var centerY = this._center.y - (this._settings.mapSize[1] / 2 - row) * h;
                            var tile = new Tile(centerX, centerY, w, h, this._settings.isometric);
                            tile.id = `t${row}-${col}`;
                            tiles[tile.id] = tile;
                        }
                    }
                    layer.tiles = tiles;
                } else {
                    var mapSize = this._settings.mapSize[0];
                    var r = 0;
                    var tiles: { [id: string]: Tile } = {};
                    for (var row = 0; row < mapSize; row++) {
                        for (var col = 0; col <= row; col++) {
                            var centerX = this._center.x + (col - row / 2.0) * w;
                            var centerY = this._center.y - (mapSize - row - 1) * h / 2;
                            var tile = new Tile(centerX, centerY, w, h, this._settings.isometric);
                            tile.id = `t${r}-${col}`;
                            tiles[tile.id] = tile;
                        }
                        r = r + 1;
                    }
                    for (var row = mapSize - 2; row >= 0; row--) {
                        for (var col = row; col >= 0; col--) {
                            var centerX = this._center.x + (col - row / 2.0) * w;
                            var centerY = this._center.y + (mapSize - row - 1) * h / 2;
                            var tile = new Tile(centerX, centerY, w, h, this._settings.isometric);
                            tile.id = `t${r}-${row - col}`;
                            tiles[tile.id] = tile;
                        }
                        r = r + 1;
                    }
                    layer.tiles = tiles;
                }
            } else {
                var tiles: { [id: string]: Tile } = {};
                for (var tileData of layerData.tiles) {
                    var tile = new Tile(tileData.center.x, tileData.center.y, w, h, this._settings.isometric);
                    tile.id = tileData.id;
                    tile.asset = this.assetByTypeAndId(assetType, tile.asset.id);
                    tiles[tile.id] = tile;
                }
                layer.tiles = tiles;
            }
            return layer;

        }

        public get groundLayer(): TileLayer {
            return this._groundLayer;
        }

        private draw() {

            this._maskLayer.clear();
            this._heightLayer.clear();
            this._groundLayer.clear();

            this._groundLayer.translate = this._translate;
            var groundImg = this._groundLayer.draw();

            this._heightLayer.translate = this._translate;
            var heightImg = this._heightLayer.draw();

            this._maskLayer.translate = this._translate;
            var maskImg = this._maskLayer.draw();

            this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            this._context.drawImage(groundImg, 0, 0);
            this._context.drawImage(maskImg, 0, 0);
            this._context.drawImage(heightImg, 0, 0);

        }

        private drawMaskLayer() {
            this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);

            this._maskLayer.clear();

            this._maskLayer.translate = this._translate;
            var maskImg = this._maskLayer.draw();


            this._context.drawImage(this._groundLayer.image, 0, 0);
            this._context.drawImage(maskImg, 0, 0);
            this._context.drawImage(this._heightLayer.image, 0, 0);
        }


        public dmove(x: number, y: number) {
            this._translate = new Point(this._translate.x + x, this._translate.y + y);
            this.draw();
        }

        public set groundAssetURLs(assetUrls: AssetData[]) {
            var map = this;
            AssetLoader.loadGroundAssets(assetUrls, function () {
                map.selectedAsset = AssetLoader.getGroundAsset(assetUrls[0].id);
                console.log(`Default asset is ${map.selectedAsset.id}.`)
            });
        }

        public get groundAssets(): Asset[] {
            return AssetLoader.groundAssets();
        }

        public set heightAssetURLs(assetUrls: AssetData[]) {
            AssetLoader.loadHeightAssets(assetUrls);
        }

        public get heightAssets(): Asset[] {
            return AssetLoader.heightAssets();
        }

        public get selectedAsset(): Asset {
            return this._selectedAsset;
        }

        public set selectedAsset(asset: Asset) {
            this._selectedAsset = asset;
        }

        public changeAsset(type: AssetType, assetId: string) {
            if (type === AssetType.Ground) {
                this.selectedAsset = AssetLoader.getGroundAsset(assetId);
            } else {
                this.selectedAsset = AssetLoader.getHeightAsset(assetId);
            }
        }

        public set mode(mode: MapMode) {
            this._mode = mode;
            this.updateCursor();
        }

        public get mode() {
            return this._mode;
        }

        public assetByTypeAndId(assetType: AssetType, id: string): Asset {
            if (assetType === AssetType.Ground) {
                return AssetLoader.getGroundAsset(id);
            } else {
                return AssetLoader.getHeightAsset(id);
            }
        }

        private updateCursor() {
            if (this._mode === MapMode.Pan) {
                this._canvas.style.cursor = "move";
            } else if (this._mode === MapMode.Edit) {
                this._canvas.style.cursor = "pointer";
            }
        }

        private mousePoint(e: MouseEvent): Point {
            var p = new Point(e.pageX, e.pageY);
            var node: HTMLElement = this._canvas;
            while (node != null) {
                p.x -= node.offsetLeft;
                p.y -= node.offsetTop;
                node = <HTMLElement>node.offsetParent;
            }
            p.translate(-this._translate.x, -this._translate.y);
            return p;
        }

        private groundTileAtPoint(p: Point): Tile {
            for (var key in this._groundLayer.tiles) {
                var tile = this._groundLayer.tiles[key];
                if (tile.contains(p)) {
                    return tile;
                }
            }
            return null;
        }

        private fillTileWithSelectedAsset(tileId: string) {
            if (this.selectedAsset == null) {
                var heightTile = this._heightLayer.tiles[tileId];
                if (heightTile != null) {
                    delete this._heightLayer.tiles[heightTile.id];
                    this.draw();
                    return
                }
                /*var groundTile = this._groundLayer.tiles[tileId];
                if (groundTile != null) {
                    delete this._groundLayer.tiles[groundTile.id];
                    this.draw();
                    return
                }*/
            } else if (this.selectedAsset.type === AssetType.Height) {
                var heightTile = this._heightLayer.tiles[tileId];
                if (heightTile == null) {
                    heightTile = this._maskLayer.highlightedTile;
                    this._heightLayer.tiles[heightTile.id] = heightTile
                }
                heightTile.asset = this.selectedAsset;
            } else {
                var groundTile = this._groundLayer.tiles[tileId];
                groundTile.asset = this.selectedAsset;
            }
            this.draw();
        }

        private mouseDown(e: MouseEvent) {
            this._isMouseDown = true;
            this._p1 = this.mousePoint(e);
            if (this._mode === MapMode.Pan || this._maskLayer.highlightedTile == null) {
                return;
            }
            this.fillTileWithSelectedAsset(this._maskLayer.highlightedTile.id);
        }

        private mouseUp(e: MouseEvent) {
            this._isMouseDown = false;
            this._maskLayer.selectedTile = this._maskLayer.highlightedTile;
            this.draw();
            console.log(JSON.stringify(this.mapData));
        }

        private mouseMove(e: MouseEvent) {
            e.preventDefault();
            var p2 = this.mousePoint(e);
            if (this._mode === MapMode.Pan) {
                if (this._isMouseDown) {
                    var diffx = p2.x - this._p1.x;
                    var diffy = p2.y - this._p1.y;
                    this.dmove(diffx, diffy);
                }
            } else {
                var tile = this.groundTileAtPoint(p2);
                if (tile == null) {
                    this._maskLayer.highlightedTile = null;
                    this.drawMaskLayer();
                    return;
                } else {
                    var hTile = tile.clone();
                    if (this._maskLayer.highlightedTile == null || hTile.id != this._maskLayer.highlightedTile.id) {
                        this._maskLayer.highlightedTile = hTile;
                        this._maskLayer.highlightedTile.asset = null;
                        this.drawMaskLayer();
                    }
                }
                if (this._isMouseDown) {
                    this._maskLayer.selectedTile = this._maskLayer.highlightedTile;
                    this.fillTileWithSelectedAsset(tile.id);
                }
            }
        }

        public get mapData(): MapData {
            return {
                settings: this._settings,
                layers: [{
                    assets: Object.keys(this._groundLayer.tiles).
                        map((id) => this._groundLayer.tiles[id]).
                        filter((t) => t.asset != null).
                        map((t) => t.asset.id).
                        filter((el, i, arr) => arr.indexOf(el) === i).
                        map((key) => {
                            return {
                                id: key,
                                url: AssetLoader.getGroundAssetURL(key)
                            }
                        }),
                    tiles: this._groundLayer.toJsonObj(),
                    type: AssetType.Ground
                }, {
                    assets: Object.keys(this._heightLayer.tiles).
                        map((id) => this._heightLayer.tiles[id]).
                        filter((t) => t.asset != null).
                        map((t) => t.asset.id).
                        filter((el, i, arr) => arr.indexOf(el) === i).
                        map((key) => {
                            return {
                                id: key,
                                url: AssetLoader.getHeightAssetURL(key)
                            }
                        }),
                    tiles: this._groundLayer.toJsonObj(),
                    type: AssetType.Height
                }]
            }
        }

        public static build(canvas: HTMLCanvasElement, data: MapData): Map {
            var map = new Map(canvas, data.settings);
            for (var layer of data.layers) {
                if (layer.type === AssetType.Ground) {
                    map.groundAssetURLs = layer.assets;
                    map._groundLayer = map.createLayer(AssetType.Ground, layer);
                } else if (layer.type === AssetType.Height) {
                    map.heightAssetURLs = layer.assets;
                    map._heightLayer = map.createLayer(AssetType.Height, layer);
                }
            }
            map._maskLayer = new MaskLayer(map._canvas.width, map._canvas.height);
            return map;
        }
    }
}