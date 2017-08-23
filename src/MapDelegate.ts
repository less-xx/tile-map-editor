module TileMap {

    export interface MapDelegate {
        didMouseDownOnTile(tile: Tile): void;
        didMouseUpOnTile(tile: Tile): void;
    }
}