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
        private _canvasSize: Size;

        private _translate: Point = new Point(0, 0);
        private _isMouseDown: boolean = false;
        private _p1: Point;
        private _activeAsset: [string, AssetType];
        private _groundLayer: TileLayer = null;
        private _heightLayer: TileLayer = null;
        private _maskLayer: MaskLayer = null;
        private _mode: MapMode = MapMode.Pan;

        private _mouseDownHandler: (e: MouseEvent) => void;
        private _mouseMoveHandler: (e: MouseEvent) => void;
        private _mouseUpHandler: (e: MouseEvent) => void;

        constructor(canvas: HTMLCanvasElement, settings: any) {

            this._canvas = canvas;
            this._settings = (<any>Object).assign({}, settings);

            this._canvasSize = new Size(this._canvas.clientWidth * Util.devicePixelRatio, this._canvas.clientHeight * Util.devicePixelRatio);
            this._canvas.width = this._canvasSize.width;
            this._canvas.height = this._canvasSize.height;
            this._canvas.focus();
            this._context = this._canvas.getContext("2d");
            this._center = new Point(this._canvas.clientWidth / 2, this._canvas.clientHeight / 2);

            this._mouseDownHandler = (e: MouseEvent) => { this.mouseDown(e); };
            this._mouseMoveHandler = (e: MouseEvent) => { this.mouseMove(e); };
            this._mouseUpHandler = (e: MouseEvent) => { this.mouseUp(e); };
            this._canvas.addEventListener("mousedown", this._mouseDownHandler, false);
            this._canvas.addEventListener("mousemove", this._mouseMoveHandler, false);
            this._canvas.addEventListener("mouseup", this._mouseUpHandler, false);

            this._groundLayer = new TileLayer(this, AssetType.Ground);
            this._groundLayer.init();

            this._heightLayer = new TileLayer(this, AssetType.Height);
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

        get canvas(): HTMLCanvasElement {
            return this._canvas;
        }

        get settings() {
            return this._settings;
        }

        public dmove(x: number, y: number) {
            this._translate = new Point(this._translate.x + x, this._translate.y + y);
            this.draw();
        }

        public setGroundAssetURLs(assetUrls: AssetData[], onComplete?: () => void) {
            var map = this;
            AssetLoader.loadGroundAssets(assetUrls, onComplete);
        }

        public get groundAssets(): Asset[] {
            return AssetLoader.groundAssets();
        }

        public setHeightAssetURLs(assetUrls: AssetData[], onComplete?: () => void) {
            var map = this;
            AssetLoader.loadHeightAssets(assetUrls, onComplete);
        }

        public get heightAssets(): Asset[] {
            return AssetLoader.heightAssets();
        }

        public set activeAsset(asset: [string, AssetType]) {
            this._activeAsset = asset;
        }

        public getActiveAsset(): [string, AssetType] {
            return this._activeAsset;
        }

        public set mode(mode: MapMode) {
            this._mode = mode;
            this.updateCursor();
        }

        public get mode() {
            return this._mode;
        }

        public assetByTypeAndId(assetType: AssetType, id: string): Asset {
            if (id == null) {
                return null;
            }
            return AssetLoader.getAssetByTypeAndKey(assetType, id);
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
            return this._groundLayer.findTileByPoint(p);
        }

        private fillTileWithActiveAsset(position: [number, number]) {
            if (this._activeAsset == null) {
                var heightTile = this._heightLayer.findTileByPosition(position);
                if (heightTile != null) {
                    this._heightLayer.deleteTileByPosition(position);
                    this.draw();
                    return
                }
            } else if (this._activeAsset[1] === AssetType.Height) {
                var heightTile = this._heightLayer.findTileByPosition(position);
                if (heightTile == null) {
                    heightTile = this._maskLayer.highlightedTile;
                    this._heightLayer.setTileAt(position, heightTile);
                }
                heightTile.assetIdType = this._activeAsset;
            } else {
                var groundTile = this._groundLayer.findTileByPosition(position);
                groundTile.assetIdType = this._activeAsset;
            }
            this.draw();
        }

        private mouseDown(e: MouseEvent) {
            this._isMouseDown = true;
            this._p1 = this.mousePoint(e);
            if (this._mode === MapMode.Pan || this._maskLayer.highlightedTile == null) {
                return;
            }
            this.fillTileWithActiveAsset(this._maskLayer.highlightedTile.position);
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
                        this._maskLayer.highlightedTile.assetIdType = null;
                        this.drawMaskLayer();
                    }
                }
                if (this._isMouseDown) {
                    this._maskLayer.selectedTile = this._maskLayer.highlightedTile;
                    this.fillTileWithActiveAsset(tile.position);
                }
            }
        }

        public get mapData(): MapData {
            var groundLayerData = this._groundLayer.getLayerData();
            groundLayerData.type = AssetType.Ground;
            var heightLayerData = this._heightLayer.getLayerData();
            heightLayerData.type = AssetType.Height;
            return {
                settings: this._settings,
                layers: [groundLayerData, heightLayerData]
            }
        }

        public static build(canvas: HTMLCanvasElement, data: MapData): Map {
            var map = new Map(canvas, data.settings);
            for (var layerData of data.layers) {
                if (layerData.type === AssetType.Ground) {
                    map.setGroundAssetURLs(layerData.assets, function () {
                        map.draw();
                    });
                    map._groundLayer.setLayerData(layerData);
                } else if (layerData.type === AssetType.Height) {
                    map.setHeightAssetURLs(layerData.assets, function () {
                        map.draw();
                    });
                    map._heightLayer.setLayerData(layerData);
                }
            }
            map._maskLayer = new MaskLayer(map._canvas.width, map._canvas.height);
            return map;
        }
    }
}