module TileMap {

    export class TileLayer {

        protected _settings: any;
        protected _assetType: AssetType;
        protected _tiles: { [id: string]: Tile } = {};
        protected _canvas: HTMLCanvasElement;
        protected _context: CanvasRenderingContext2D;
        protected _translate: Point = new Point(0, 0);
        protected _drawStyle: ITileDrawStyle = {
            fillStyle: null,
            strokeStyle: null,
            strokeWidth: 0,
            useAsset: true
        };


        constructor(width: number, height: number, assetType: AssetType, settings: any) {
            this._canvas = document.createElement("canvas");
            this._canvas.width = width;
            this._canvas.height = height;
            this._assetType = assetType;
            this._settings = settings;
            this._context = this._canvas.getContext("2d");
            this._context.scale(Util.devicePixelRatio, Util.devicePixelRatio);
        }

        public set tiles(tiles: { [id: string]: Tile }) {
            this._tiles = tiles;
        }

        public get tiles(): { [id: string]: Tile } {
            return this._tiles;
        }

        public set translate(translate: Point) {
            this._translate = translate;
        }

        public set drawStyle(drawStyle: ITileDrawStyle) {
            this._drawStyle = drawStyle;
        }

        public get image() {
            return this._canvas;
        }

        clear() {
            this._context.save();
            this._context.translate(0, 0)
            this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            this._context.restore();
        }

        draw(): HTMLCanvasElement {
            this._context.save();
            this._context.translate(this._translate.x, this._translate.y);
            for (var key in this._tiles) {
                var tile = this._tiles[key];
                tile.draw(this._context, this._drawStyle);
            }
            this._context.restore();
            return this._canvas;
        }

        setLayerData(layerData: LayerData) {
            var tiles: { [id: string]: Tile } = {};

            for (var tileData of layerData.tiles) {
                var tile = new Tile(tileData.center.x, tileData.center.y, this._settings.tileSize[0], this._settings.tileSize[1], this._settings.isometric);
                tile.id = tileData.id;
                if (tileData.asset != null) {
                    tile.assetIdType = [tileData.asset, this._assetType];
                }
                tiles[tile.id] = tile;
            }
            this._tiles = tiles;
        }

        getLayerData(): LayerData {
            return {
                assets: Object.keys(this.tiles).
                    map((id) => this.tiles[id]).
                    filter((t) => t.assetIdType != null).
                    map((t) => t.assetIdType[0]).
                    filter((el, i, arr) => arr.indexOf(el) === i).
                    map((key) => {
                        return {
                            id: key,
                            url: AssetLoader.getAssetURLByTypeAndKey(this._assetType, key)
                        }
                    }),
                tiles: Object.keys(this._tiles).map((key) => this._tiles[key].tileData),
                type: this._assetType
            };
        }
    }
}