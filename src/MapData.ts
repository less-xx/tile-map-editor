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
        position: [number, number];
        center: Point;
        asset?: string;
    }

    export interface AssetData {
        id: string;
        url: string;
    }
}