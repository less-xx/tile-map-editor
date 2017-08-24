module TileMap {

    

    export class Util {

        /**
         * Jonas Raoni Soares Silva
         * http://jsfromhell.com/math/is-point-in-poly [rev. #0]
         * @param poly 
         * @param pt 
         */
        public static isPointInPoly(poly: Point[] , pt: Point) {
            for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
                ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
                    && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
                    && (c = !c);
            return c;
        }

        /**
         * Get device pixel ratio
         */
        public static get devicePixelRatio(): number {
            return (('devicePixelRatio' in window) && (window.devicePixelRatio > 1)) ? window.devicePixelRatio : 1;
            //return 1;
        }

        public static get baseUrl(): string {
            var loc = window.location;
            return `${loc.protocol}//${loc.host}`;
        }
    }
}