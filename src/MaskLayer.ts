module TileMap {

    export class MaskLayer {

        private _highlightedTile: Tile = null;
        private _selectedTile: Tile = null;
        private _canvas: HTMLCanvasElement;
        private _context: CanvasRenderingContext2D;
        private _translate: Point = new Point(0, 0);

        private _highlightedTileDawStyle: ITileDrawStyle = {
            fillStyle: "rgba(200, 100, 100, 0.3)",
            strokeStyle: "rgba(0, 0, 200, 0.3)",
            strokeWidth: 1.0,
            useAsset: false
        };

        private _selectedTileDawStyle: ITileDrawStyle = {
            fillStyle: "rgba(200, 100, 100, 0.3)",
            strokeStyle: "rgba(255, 255, 0, 0.8)",
            strokeWidth: 3.0,
            useAsset: false
        };

        private _selectedTileAssetDawStyle: ITileDrawStyle = {
            fillStyle: "rgba(200, 100, 100, 0.1)",
            strokeStyle: "rgba(10, 10, 220, 0.2)",
            strokeWidth: 1.0,
            useAsset: true
        };

        constructor(width: number, height: number) {
            this._canvas = document.createElement("canvas");
            this._canvas.width = width;
            this._canvas.height = height;
            this._context = this._canvas.getContext("2d");
            this._context.scale(Util.devicePixelRatio, Util.devicePixelRatio);
        }

        public get highlightedTile(): Tile {
            return this._highlightedTile;
        }

        public set highlightedTile(tile: Tile) {
            this._highlightedTile = tile;
        }

        public get selectedTile(): Tile {
            return this._selectedTile;
        }

        public set selectedTile(tile: Tile) {
            this._selectedTile = tile;
        }

        public set highlightedDrawStyle(style: ITileDrawStyle) {
            this._highlightedTileDawStyle = style;
        }

        public set selectedDrawStyle(style: ITileDrawStyle) {
            this._selectedTileDawStyle = style;
        }

        public set translate(translate: Point) {
            this._translate = translate;
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
            if (this.selectedTile != null) {
                if (this.selectedTile.assetIdType == null) {
                    this.selectedTile.draw(this._context, this._selectedTileDawStyle);
                } else {
                    this._context.shadowBlur = 20;
                    this._context.shadowColor = "black";
                    this.selectedTile.draw(this._context, this._selectedTileAssetDawStyle);
                }

            }
            if (this.highlightedTile != null && this.highlightedTile != this.selectedTile) {
                this.highlightedTile.draw(this._context, this._highlightedTileDawStyle);
            }
            this._context.restore();
            return this._canvas;
        }
    }
}