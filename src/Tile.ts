module TileMap {

    export class Tile {

        private _shape: Point[];
        private _assetIdType: [string, AssetType];
        private _isometric: boolean = false;
        private _size: Size;
        private _startPoint: Point;
        private _centerX: number;
        private _centerY: number;
        private _position: [number, number];

        constructor(position: [number, number], centerX: number, centerY: number, width: number, height: number, isometric: boolean) {
            this._position = position;
            this._centerX = centerX;
            this._centerY = centerY;
            this._isometric = isometric;
            if (!isometric) {
                this._shape = [
                    new Point(centerX - width / 2.0, centerY - height / 2.0),
                    new Point(centerX + width / 2.0, centerY - height / 2.0),
                    new Point(centerX + width / 2.0, centerY + height / 2.0),
                    new Point(centerX - width / 2.0, centerY + height / 2.0)
                ];
            } else {
                this._shape = [
                    new Point(centerX, centerY - height / 2.0),
                    new Point(centerX + width / 2.0, centerY),
                    new Point(centerX, centerY + height / 2.0),
                    new Point(centerX - width / 2.0, centerY)
                ];
            }
            this._startPoint = new Point(centerX - width / 2.0, centerY - height / 2.0);
            this._size = new Size(width, height);
        }

        public get id(): string {
            return `t${this._position[0]}_${this._position[1]}`;
        }

        public set assetIdType(assetIdType: [string, AssetType]) {
            this._assetIdType = assetIdType;
        }

        public get assetIdType(): [string, AssetType] {
            return this._assetIdType;
        }

        public get startPoint(): Point {
            return this._startPoint;
        }

        public get size(): Size {
            return this._size;
        }

        public get center(): Point {
            return new Point(this._centerX, this._centerY);
        }

        public contains(point: Point): boolean {
            return Util.isPointInPoly(this._shape, point);
        }

        public get position(): [number, number] {
            return this._position;
        }

        draw(context: CanvasRenderingContext2D, drawStyle: ITileDrawStyle) {

            if (this._shape.length == 0) {
                return;
            }
            context.beginPath();
            context.moveTo(this._shape[0].x, this._shape[0].y);
            for (var i = 1; i < this._shape.length; i++) {
                context.lineTo(this._shape[i].x, this._shape[i].y);
            }
            context.closePath();

            if (drawStyle.fillStyle != null) {
                context.fillStyle = drawStyle.fillStyle;
                context.fill();
            }

            if (drawStyle.strokeStyle != null && drawStyle.strokeWidth > 0) {
                context.lineWidth = drawStyle.strokeWidth;
                context.strokeStyle = drawStyle.strokeStyle;
                context.stroke();
            }

            if (this._assetIdType != null && drawStyle.useAsset) {
                var asset = AssetLoader.getAssetByTypeAndKey(this._assetIdType[1], this._assetIdType[0]);
                if (asset != null) {
                    context.drawImage(asset.image, this.startPoint.x, this.startPoint.y - asset.image.height + this._size.height, this._size.width, asset.image.height);
                }
            }
        }

        clone(): Tile {
            var tile = new Tile(this._position, this._centerX, this._centerY, this._size.width, this._size.height, this._isometric);
            tile._assetIdType = this._assetIdType;
            return tile;
        }

        get tileData(): TileData {
            return {
                position: this._position,
                center: this.center,
                asset: this._assetIdType == null ? null : this._assetIdType[0]
            };
        }
    }
}
