module TileMap {

    declare interface ObjectConstructor {
        assign(...objects: Object[]): Object;
    }

    export enum MapMode {
        Pan = "pan",
        Edit = "edit"
    }

    export class Map {

        private settings = {
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
            this.settings = (<any>Object).assign({}, settings);

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

            this._groundLayer = new TileLayer(this._canvas.width, this._canvas.height);
            this._heightLayer = new TileLayer(this._canvas.width, this._canvas.height);

            if (!this.settings.isometric) {
                var w = this.settings.tileSize[0];
                var h = this.settings.tileSize[1];
                var tiles: { [id: string]: Tile } = {};
                for (var row = 0; row < this.settings.mapSize[0]; row++) {
                    for (var col = 0; col < this.settings.mapSize[1]; col++) {
                        var centerX = this._center.x - (this.settings.mapSize[0] / 2 - col) * w;
                        var centerY = this._center.y - (this.settings.mapSize[1] / 2 - row) * h;
                        var tile = new Tile(centerX, centerY, w, h, this.settings.isometric);
                        tile.id = `t${row}-${col}`;
                        tiles[tile.id] = tile;
                    }
                }
                this._groundLayer.tiles = tiles;
            } else {
                var w = this.settings.tileSize[0];
                var h = this.settings.tileSize[1];
                var mapSize = this.settings.mapSize[0];
                var r = 0;
                var tiles: { [id: string]: Tile } = {};
                for (var row = 0; row < mapSize; row++) {
                    for (var col = 0; col <= row; col++) {
                        var centerX = this._center.x + (col - row / 2.0) * w;
                        var centerY = this._center.y - (mapSize - row - 1) * h / 2;
                        var tile = new Tile(centerX, centerY, w, h, this.settings.isometric);
                        tile.id = `t${r}-${col}`;
                        tiles[tile.id] = tile;
                    }
                    r = r + 1;
                }
                for (var row = mapSize - 2; row >= 0; row--) {
                    for (var col = row; col >= 0; col--) {
                        var centerX = this._center.x + (col - row / 2.0) * w;
                        var centerY = this._center.y + (mapSize - row - 1) * h / 2;
                        var tile = new Tile(centerX, centerY, w, h, this.settings.isometric);
                        tile.id = `t${r}-${row - col}`;
                        tiles[tile.id] = tile;
                    }
                    r = r + 1;
                }
                this._groundLayer.tiles = tiles;
            }
            this._maskLayer = new MaskLayer(this._canvas.width, this._canvas.height);
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

        public set groundAssetURLs(assetUrls: { [id: string]: string }) {
            var map = this;
            AssetLoader.loadGroundAssets(assetUrls, function () {
                map.selectedAsset = AssetLoader.getGroundAsset(Object.keys(assetUrls)[0]);
                console.log(`Default asset is ${map.selectedAsset.id}.`)
            });
        }

        public get groundAssets(): Asset[] {
            return AssetLoader.groundAssets();
        }

        public set heightAssetURLs(assetUrls: { [id: string]: string }) {
            var map = this;
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

        private fillTileWithAsset(tile: Tile) {
            console.log(`will fill tile ${tile.id}`);
            tile.asset = this.selectedAsset;
            this.draw();
        }

        private mouseDown(e: MouseEvent) {
            this._isMouseDown = true;
            this._p1 = this.mousePoint(e);
            if (this._mode === MapMode.Pan || this._maskLayer.highlightedTile == null) {
                return;
            }
            if (this.selectedAsset == null) {
                var heightTile = this._heightLayer.tiles[this._maskLayer.highlightedTile.id];
                if (heightTile != null) {
                    delete this._heightLayer.tiles[this._maskLayer.highlightedTile.id];
                }
                this._maskLayer.selectedTile = this._maskLayer.highlightedTile;
                this._maskLayer.selectedTile.asset = null;
            } else if (this.selectedAsset.type === AssetType.Height) {
                var heightTile = this._heightLayer.tiles[this._maskLayer.highlightedTile.id];
                if (heightTile == null) {
                    heightTile = this._maskLayer.highlightedTile.clone();
                    this._heightLayer.tiles[heightTile.id] = heightTile
                }
                heightTile.asset = this.selectedAsset;
            } else {
                var groundTile = this._groundLayer.tiles[this._maskLayer.highlightedTile.id];
                groundTile.asset = this.selectedAsset;
            }

            this.draw();
        }

        private mouseUp(e: MouseEvent) {
            this._isMouseDown = false;
            console.log(this.toJson());
        }

        private mouseMove(e: MouseEvent) {
            e.preventDefault();
            var p2 = this.mousePoint(e);
            if (this._isMouseDown) {
                if (this._mode === MapMode.Pan) {
                    var diffx = p2.x - this._p1.x;
                    var diffy = p2.y - this._p1.y;
                    this.dmove(diffx, diffy);
                } else {
                    var tile = this.groundTileAtPoint(p2);
                    if (tile != null) {
                        this.fillTileWithAsset(tile.clone());
                    }
                }
            } else {
                var tile = this.groundTileAtPoint(p2);
                if (tile == null) {
                    this._maskLayer.highlightedTile = null;
                    this.drawMaskLayer();
                } else {
                    var hTile = tile.clone();
                    if (this._maskLayer.highlightedTile == null || hTile.id != this._maskLayer.highlightedTile.id) {
                        this._maskLayer.highlightedTile = hTile;
                        this.drawMaskLayer();
                    }
                }
            }
        }

        public toJson(): string {
            return JSON.stringify({
                layers: [this._groundLayer.toJsonObj(), this._heightLayer.toJsonObj()]
            });
        }
    }
}