module TileMap {
    
    export class Point
    {
        public x: number;
        public y: number;

        constructor(x: number, y: number)
        {
            this.x = x;
            this.y = y;
        }

        public translate(x:number, y:number){
            this.x = this.x + x;
            this.y = this.y + y;
        }
    }
}