module TileMap {

    export class AssetLoader {

        private static _groundAssets: { [id: string]: Asset } = {};
        private static _heightAssets: { [id: string]: Asset } = {};

        public static loadGroundAssets(assetUrls: { [id: string]: string }, success?: () => void) {
            AssetLoader._groundAssets = {};
            AssetLoader.load(AssetType.Ground, assetUrls, AssetLoader._groundAssets, success);
        }

        public static loadHeightAssets(assetUrls: { [id: string]: string }, success?: () => void) {
            AssetLoader._heightAssets = {};
            AssetLoader.load(AssetType.Height, assetUrls, AssetLoader._heightAssets, success);
        }

        private static load(type: AssetType, assetUrls: { [id: string]: string }, target: { [id: string]: Asset }, success?: () => void) {
            var loaded = 0;
            var assetNum = Object.keys(assetUrls).length
            var defaultKey = Object.keys(assetUrls)[0];
            for (var key in assetUrls) {
                var url = assetUrls[key];
                var img = new Image();
                target[key] = new Asset(key, type, img);
                img.onload = function () {
                    loaded++;
                    if (loaded >= assetNum) {
                        console.log(`Loaded ${loaded} ${type} assets`);
                        if (success) {
                            success();
                        }
                    }
                };
                img.onerror = function () { console.log("image load failed"); }
                img.crossOrigin = "anonymous";
                img.src = url;
            }
        }

        public static getGroundAsset(key: string): Asset {
            return AssetLoader._groundAssets[key];
        }

        public static getHeightAsset(key: string): Asset {
            return AssetLoader._heightAssets[key];
        }

        public static groundAssets(): Asset[] {
            return Object.keys(AssetLoader._groundAssets).map((key) => AssetLoader._groundAssets[key]);
        }

        public static heightAssets(): Asset[] {
            return Object.keys(AssetLoader._heightAssets).map((key) => AssetLoader._heightAssets[key]);
        }
    }
}