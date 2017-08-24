module TileMap {

    export class AssetLoader {

        private static _groundAssets: { [id: string]: Asset } = {};
        private static _heightAssets: { [id: string]: Asset } = {};
        private static _groundAssetURLs: AssetData[] = [];
        private static _heightAssetURLs: AssetData[] = [];

        public static loadGroundAssets(assetUrls: AssetData[], success?: () => void) {
            AssetLoader._groundAssetURLs = assetUrls;
            AssetLoader._groundAssets = {};
            AssetLoader.load(AssetType.Ground, assetUrls, AssetLoader._groundAssets, success);
        }

        public static loadHeightAssets(assetUrls: AssetData[], success?: () => void) {
            AssetLoader._heightAssetURLs = assetUrls;
            AssetLoader._heightAssets = {};
            AssetLoader.load(AssetType.Height, assetUrls, AssetLoader._heightAssets, success);
        }

        private static load(type: AssetType, assetUrls: AssetData[], target: { [id: string]: Asset }, success?: () => void) {
            var loaded = 0;
            for (var assetUrl of assetUrls) {
                var img = new Image();
                target[assetUrl.id] = new Asset(assetUrl.id, type, img);
                img.onload = function () {
                    loaded++;
                    if (loaded >= assetUrls.length) {
                        console.log(`Loaded ${loaded} ${type} assets`);
                        if (success) {
                            success();
                        }
                    }
                };
                img.onerror = function () { console.log("image load failed"); }
                img.crossOrigin = "anonymous";
                img.src = assetUrl.url;
            }
        }
        private static getAssetUrl(key: string, container: AssetData[]): string {
            var assetUrl = container.filter((e) => e.id === key)
            if (assetUrl != null && assetUrl.length > 0) {
                var url = assetUrl[0].url;
                if (url.indexOf("http") == 0) {
                    return url;
                }
                return `${Util.baseUrl}${url}`;
            }
            return "";
        }
        public static getGroundAssetURL(key: string): string {
            return AssetLoader.getAssetUrl(key, AssetLoader._groundAssetURLs);
        }

        public static getGroundAsset(key: string): Asset {
            return AssetLoader._groundAssets[key];
        }

        public static getHeightAssetURL(key: string): string {
            return AssetLoader.getAssetUrl(key, AssetLoader._heightAssetURLs);
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