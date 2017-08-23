module TileMap {

    export class GroundTileLayer {

        private _tiles: Tile[] = [];
        private _canvas: HTMLCanvasElement;
        private _context: CanvasRenderingContext2D;
        private _translate: Point = new Point(0, 0);
        private _drawStyle: ITileDrawStyle = {
            fillStyle: "rgba(100, 100, 100, 0.2)",
            strokeStyle: "rgba(100, 100, 100, 0.2)",
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

        public set tiles(tiles: Tile[]) {
            this._tiles = tiles;
        }

        public set translate(translate: Point) {
            this._translate = translate;
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
            this._tiles.forEach((tile, index) => tile.draw(this._context, this._drawStyle));
            this._context.restore();
            return this._canvas;
        }

        toJsonObj(): any {
            return {
                tiles: this._tiles.map((t) => t.toJsonObj())
            };
        }
    }
}