module TileMap {

    export interface MapData {
        layers: LayerData[];
        settings: any;
    }

    export interface LayerData {
        assets: AssetData[];
        tiles: TileData[];
        type: AssetType;
    }

    export interface TileData {
        id: string;
        center: Point;
        asset?: string;
    }

    export interface AssetData {
        id: string;
        url: string;
    }
}