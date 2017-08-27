module TileMap {

    export class TileLayer {

        protected _settings: any;
        protected _assetType: AssetType;
        protected _tiles: Tile[][] = [[]];
        protected _canvas: HTMLCanvasElement;
        protected _center: Point;
        protected _context: CanvasRenderingContext2D;
        protected _translate: Point = new Point(0, 0);
        protected _drawStyle: ITileDrawStyle = {
            fillStyle: null,
            strokeStyle: null,
            strokeWidth: 0,
            useAsset: true
        };


        constructor(map: Map, assetType: AssetType) {
            this._canvas = document.createElement("canvas");
            this._canvas.width = map.canvas.width
            this._canvas.height = map.canvas.height;
            this._center = new Point(map.canvas.clientWidth / 2, map.canvas.clientHeight / 2);
            this._assetType = assetType;
            this._settings = map.settings;
            this._context = this._canvas.getContext("2d");
            this._context.scale(Util.devicePixelRatio, Util.devicePixelRatio);
        }

        public init() {
            var w = this._settings.tileSize[0];
            var h = this._settings.tileSize[1];
            if (!this._settings.isometric) {
                for (var row = 0; row < this._settings.mapSize[0]; row++) {
                    for (var col = 0; col < this._settings.mapSize[1]; col++) {
                        var centerX = this._center.x - (this._settings.mapSize[0] / 2 - col) * w;
                        var centerY = this._center.y - (this._settings.mapSize[1] / 2 - row) * h;
                        var tile = new Tile([row, col], centerX, centerY, w, h, this._settings.isometric);
                        this.setTileAt([row, col], tile);
                    }
                }
            } else {
                var mapSize = this._settings.mapSize[0];
                var r = 0;
                for (var row = 0; row < mapSize; row++) {
                    for (var col = 0; col <= row; col++) {
                        var centerX = this._center.x + (col - row / 2.0) * w;
                        var centerY = this._center.y - (mapSize - row - 1) * h / 2;
                        var tile = new Tile([r, col], centerX, centerY, w, h, this._settings.isometric);
                        this.setTileAt([r, col], tile);
                    }
                    r = r + 1;
                }
                for (var row = mapSize - 2; row >= 0; row--) {
                    for (var col = row; col >= 0; col--) {
                        var centerX = this._center.x + (col - row / 2.0) * w;
                        var centerY = this._center.y + (mapSize - row - 1) * h / 2;
                        var tile = new Tile([r, col], centerX, centerY, w, h, this._settings.isometric);
                        this.setTileAt([r, col], tile);
                    }
                    r = r + 1;
                }
            }
        }

        public setTileAt(position: [number, number], tile: Tile) {
            var colTiles = this._tiles[position[0]];
            if (colTiles == null) {
                colTiles = [];
                this._tiles[position[0]] = colTiles;
            }
            colTiles[position[1]] = tile;
        }

        public findTileByPosition(position: [number, number]): Tile {
            var colTiles = this._tiles[position[0]];
            if (colTiles == null) {
                return null;
            }
            return colTiles[position[1]];
        }

        public deleteTileByPosition(position: [number, number]): Tile {
            var colTiles = this._tiles[position[0]];
            if (colTiles == null) {
                return null;
            }
            var tile = colTiles[position[1]];
            delete colTiles[position[1]];
            return tile;
        }

        public findTileByPoint(p: Point): Tile {
            for (var row = 0; row < this._tiles.length; row++) {
                var colTiles = this._tiles[row];
                if (colTiles == null) {
                    continue;
                }
                for (var col = 0; col < colTiles.length; col++) {
                    var tile = colTiles[col];
                    if (tile == null) {
                        continue;
                    }
                    if (tile.contains(p)) {
                        return tile;
                    }
                }
            }
            return null;
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
            var layer = this;
            this.iterate(function (tile: Tile) {
                tile.draw(layer._context, layer._drawStyle);
            });
            this._context.restore();
            return this._canvas;
        }

        iterate(handleTile: (tile: Tile) => void) {
            for (var row = 0; row < this._tiles.length; row++) {
                var colTiles = this._tiles[row];
                if (colTiles == null) {
                    continue;
                }
                for (var col = 0; col < colTiles.length; col++) {
                    var tile = colTiles[col];
                    if (tile == null) {
                        continue;
                    }
                    handleTile(tile);
                }
            }
        }

        setLayerData(layerData: LayerData) {
            var tiles: Tile[][] = [[]];
            for (var tileData of layerData.tiles) {
                var tile = new Tile(tileData.position, tileData.center.x, tileData.center.y, this._settings.tileSize[0], this._settings.tileSize[1], this._settings.isometric);
                if (tileData.asset != null) {
                    tile.assetIdType = [tileData.asset, this._assetType];
                }
                var colTiles = tiles[tileData.position[0]];
                if (colTiles == null) {
                    colTiles = [];
                    tiles[tileData.position[0]] = colTiles;
                }
                colTiles[tileData.position[1]] = tile;
            }
            this._tiles = tiles;
        }

        getLayerData(): LayerData {
            var assetIds: string[] = [];
            var tiles: TileData[] = [];
            this.iterate(function (tile: Tile) {
                tiles.push(tile.tileData);
                if (tile.assetIdType != null && assetIds.indexOf(tile.assetIdType[0]) < 0) {
                    assetIds.push(tile.assetIdType[0]);
                }
            });

            return {
                assets: assetIds
                    .map((id) => {
                        return {
                            id: id,
                            url: AssetLoader.getAssetURLByTypeAndKey(this._assetType, id)
                        }
                    }),
                tiles: tiles,
                type: this._assetType
            };
        }
    }
}