module TileMap {

    export enum AssetType {
        Ground = "ground",
        Height = "height"
    }

    export class Asset {

        private _type: AssetType;
        private _id: string;
        private _image: HTMLImageElement;

        constructor(id:string, type: AssetType, image: HTMLImageElement) {
            this._id = id;
            this._type = type;
            this._image = image;
        }

        public get id(): string {
            return this._id;
        }

        public get type(): AssetType {
            return this._type;
        }

        public get image(): HTMLImageElement {
            return this._image;
        }
    }
}