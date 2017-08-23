var TileMap;
(function (TileMap) {
    var AssetType;
    (function (AssetType) {
        AssetType["Ground"] = "ground";
        AssetType["Height"] = "height";
    })(AssetType = TileMap.AssetType || (TileMap.AssetType = {}));
    var Asset = (function () {
        function Asset(id, type, image) {
            this._id = id;
            this._type = type;
            this._image = image;
        }
        Object.defineProperty(Asset.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Asset.prototype, "type", {
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Asset.prototype, "image", {
            get: function () {
                return this._image;
            },
            enumerable: true,
            configurable: true
        });
        return Asset;
    }());
    TileMap.Asset = Asset;
})(TileMap || (TileMap = {}));
var TileMap;
(function (TileMap) {
    var AssetLoader = (function () {
        function AssetLoader() {
        }
        AssetLoader.loadGroundAssets = function (assetUrls, success) {
            AssetLoader._groundAssets = {};
            AssetLoader.load(TileMap.AssetType.Ground, assetUrls, AssetLoader._groundAssets, success);
        };
        AssetLoader.loadHeightAssets = function (assetUrls, success) {
            AssetLoader._heightAssets = {};
            AssetLoader.load(TileMap.AssetType.Height, assetUrls, AssetLoader._heightAssets, success);
        };
        AssetLoader.load = function (type, assetUrls, target, success) {
            var loaded = 0;
            var assetNum = Object.keys(assetUrls).length;
            var defaultKey = Object.keys(assetUrls)[0];
            for (var key in assetUrls) {
                var url = assetUrls[key];
                var img = new Image();
                target[key] = new TileMap.Asset(key, type, img);
                img.onload = function () {
                    loaded++;
                    if (loaded >= assetNum) {
                        console.log("Loaded " + loaded + " " + type + " assets");
                        if (success) {
                            success();
                        }
                    }
                };
                img.onerror = function () { console.log("image load failed"); };
                img.crossOrigin = "anonymous";
                img.src = url;
            }
        };
        AssetLoader.getGroundAsset = function (key) {
            return AssetLoader._groundAssets[key];
        };
        AssetLoader.getHeightAsset = function (key) {
            return AssetLoader._heightAssets[key];
        };
        AssetLoader.groundAssets = function () {
            return Object.keys(AssetLoader._groundAssets).map(function (key) { return AssetLoader._groundAssets[key]; });
        };
        AssetLoader.heightAssets = function () {
            return Object.keys(AssetLoader._heightAssets).map(function (key) { return AssetLoader._heightAssets[key]; });
        };
        AssetLoader._groundAssets = {};
        AssetLoader._heightAssets = {};
        return AssetLoader;
    }());
    TileMap.AssetLoader = AssetLoader;
})(TileMap || (TileMap = {}));
var TileMap;
(function (TileMap) {
    var GroundTileLayer = (function () {
        function GroundTileLayer(width, height) {
            this._tiles = [];
            this._translate = new TileMap.Point(0, 0);
            this._drawStyle = {
                fillStyle: "rgba(100, 100, 100, 0.2)",
                strokeStyle: "rgba(100, 100, 100, 0.2)",
                strokeWidth: 1.0,
                useAsset: true
            };
            this._canvas = document.createElement("canvas");
            this._canvas.width = width;
            this._canvas.height = height;
            this._context = this._canvas.getContext("2d");
            this._context.scale(TileMap.Util.devicePixelRatio, TileMap.Util.devicePixelRatio);
        }
        Object.defineProperty(GroundTileLayer.prototype, "tiles", {
            set: function (tiles) {
                this._tiles = tiles;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GroundTileLayer.prototype, "translate", {
            set: function (translate) {
                this._translate = translate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GroundTileLayer.prototype, "image", {
            get: function () {
                return this._canvas;
            },
            enumerable: true,
            configurable: true
        });
        GroundTileLayer.prototype.clear = function () {
            this._context.save();
            this._context.translate(0, 0);
            this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            this._context.restore();
        };
        GroundTileLayer.prototype.draw = function () {
            var _this = this;
            this._context.save();
            this._context.translate(this._translate.x, this._translate.y);
            this._tiles.forEach(function (tile, index) { return tile.draw(_this._context, _this._drawStyle); });
            this._context.restore();
            return this._canvas;
        };
        GroundTileLayer.prototype.toJsonObj = function () {
            return {
                tiles: this._tiles.map(function (t) { return t.toJsonObj(); })
            };
        };
        return GroundTileLayer;
    }());
    TileMap.GroundTileLayer = GroundTileLayer;
})(TileMap || (TileMap = {}));
var TileMap;
(function (TileMap) {
    var MapMode;
    (function (MapMode) {
        MapMode["Pan"] = "pan";
        MapMode["Edit"] = "edit";
    })(MapMode = TileMap.MapMode || (TileMap.MapMode = {}));
    var Map = (function () {
        function Map(canvas, settings) {
            var _this = this;
            this.settings = {
                tileSize: [32, 32],
                mapSize: [10, 10],
                isometric: false
            };
            this._translate = new TileMap.Point(0, 0);
            this._isMouseDown = false;
            this._selectedAsset = null;
            this._groundLayer = null;
            this._heightLayer = null;
            this._maskLayer = null;
            this._mode = MapMode.Pan;
            this._canvas = canvas;
            this.settings = Object.assign({}, settings);
            this._canvas.width = this._canvas.clientWidth * TileMap.Util.devicePixelRatio;
            this._canvas.height = this._canvas.clientHeight * TileMap.Util.devicePixelRatio;
            this._canvas.focus();
            this._context = this._canvas.getContext("2d");
            this._center = new TileMap.Point(this._canvas.clientWidth / 2, this._canvas.clientHeight / 2);
            this._mouseDownHandler = function (e) { _this.mouseDown(e); };
            this._mouseMoveHandler = function (e) { _this.mouseMove(e); };
            this._mouseUpHandler = function (e) { _this.mouseUp(e); };
            this._canvas.addEventListener("mousedown", this._mouseDownHandler, false);
            this._canvas.addEventListener("mousemove", this._mouseMoveHandler, false);
            this._canvas.addEventListener("mouseup", this._mouseUpHandler, false);
            this._groundLayer = new TileMap.TileLayer(this._canvas.width, this._canvas.height);
            this._heightLayer = new TileMap.TileLayer(this._canvas.width, this._canvas.height);
            if (!this.settings.isometric) {
                var w = this.settings.tileSize[0];
                var h = this.settings.tileSize[1];
                var tiles = {};
                for (var row = 0; row < this.settings.mapSize[0]; row++) {
                    for (var col = 0; col < this.settings.mapSize[1]; col++) {
                        var centerX = this._center.x - (this.settings.mapSize[0] / 2 - col) * w;
                        var centerY = this._center.y - (this.settings.mapSize[1] / 2 - row) * h;
                        var tile = new TileMap.Tile(centerX, centerY, w, h, this.settings.isometric);
                        tile.id = "t" + row + "-" + col;
                        tiles[tile.id] = tile;
                    }
                }
                this._groundLayer.tiles = tiles;
            }
            else {
                var w = this.settings.tileSize[0];
                var h = this.settings.tileSize[1];
                var mapSize = this.settings.mapSize[0];
                var r = 0;
                var tiles = {};
                for (var row = 0; row < mapSize; row++) {
                    for (var col = 0; col <= row; col++) {
                        var centerX = this._center.x + (col - row / 2.0) * w;
                        var centerY = this._center.y - (mapSize - row - 1) * h / 2;
                        var tile = new TileMap.Tile(centerX, centerY, w, h, this.settings.isometric);
                        tile.id = "t" + r + "-" + col;
                        tiles[tile.id] = tile;
                    }
                    r = r + 1;
                }
                for (var row = mapSize - 2; row >= 0; row--) {
                    for (var col = row; col >= 0; col--) {
                        var centerX = this._center.x + (col - row / 2.0) * w;
                        var centerY = this._center.y + (mapSize - row - 1) * h / 2;
                        var tile = new TileMap.Tile(centerX, centerY, w, h, this.settings.isometric);
                        tile.id = "t" + r + "-" + (row - col);
                        tiles[tile.id] = tile;
                    }
                    r = r + 1;
                }
                this._groundLayer.tiles = tiles;
            }
            this._maskLayer = new TileMap.MaskLayer(this._canvas.width, this._canvas.height);
        }
        Object.defineProperty(Map.prototype, "groundLayer", {
            get: function () {
                return this._groundLayer;
            },
            enumerable: true,
            configurable: true
        });
        Map.prototype.draw = function () {
            this._maskLayer.clear();
            this._heightLayer.clear();
            this._groundLayer.clear();
            this._groundLayer.translate = this._translate;
            var groundImg = this._groundLayer.draw();
            this._heightLayer.translate = this._translate;
            var heightImg = this._heightLayer.draw();
            this._maskLayer.translate = this._translate;
            var maskImg = this._maskLayer.draw();
            this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            this._context.drawImage(groundImg, 0, 0);
            this._context.drawImage(maskImg, 0, 0);
            this._context.drawImage(heightImg, 0, 0);
        };
        Map.prototype.drawMaskLayer = function () {
            this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            this._maskLayer.clear();
            this._maskLayer.translate = this._translate;
            var maskImg = this._maskLayer.draw();
            this._context.drawImage(this._groundLayer.image, 0, 0);
            this._context.drawImage(maskImg, 0, 0);
            this._context.drawImage(this._heightLayer.image, 0, 0);
        };
        Map.prototype.dmove = function (x, y) {
            this._translate = new TileMap.Point(this._translate.x + x, this._translate.y + y);
            this.draw();
        };
        Object.defineProperty(Map.prototype, "groundAssetURLs", {
            set: function (assetUrls) {
                var map = this;
                TileMap.AssetLoader.loadGroundAssets(assetUrls, function () {
                    map.selectedAsset = TileMap.AssetLoader.getGroundAsset(Object.keys(assetUrls)[0]);
                    console.log("Default asset is " + map.selectedAsset.id + ".");
                });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Map.prototype, "groundAssets", {
            get: function () {
                return TileMap.AssetLoader.groundAssets();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Map.prototype, "heightAssetURLs", {
            set: function (assetUrls) {
                var map = this;
                TileMap.AssetLoader.loadHeightAssets(assetUrls);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Map.prototype, "heightAssets", {
            get: function () {
                return TileMap.AssetLoader.heightAssets();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Map.prototype, "selectedAsset", {
            get: function () {
                return this._selectedAsset;
            },
            set: function (asset) {
                this._selectedAsset = asset;
            },
            enumerable: true,
            configurable: true
        });
        Map.prototype.changeAsset = function (type, assetId) {
            if (type === TileMap.AssetType.Ground) {
                this.selectedAsset = TileMap.AssetLoader.getGroundAsset(assetId);
            }
            else {
                this.selectedAsset = TileMap.AssetLoader.getHeightAsset(assetId);
            }
        };
        Object.defineProperty(Map.prototype, "mode", {
            get: function () {
                return this._mode;
            },
            set: function (mode) {
                this._mode = mode;
                this.updateCursor();
            },
            enumerable: true,
            configurable: true
        });
        Map.prototype.assetByTypeAndId = function (assetType, id) {
            if (assetType === TileMap.AssetType.Ground) {
                return TileMap.AssetLoader.getGroundAsset(id);
            }
            else {
                return TileMap.AssetLoader.getHeightAsset(id);
            }
        };
        Map.prototype.updateCursor = function () {
            if (this._mode === MapMode.Pan) {
                this._canvas.style.cursor = "move";
            }
            else if (this._mode === MapMode.Edit) {
                this._canvas.style.cursor = "pointer";
            }
        };
        Map.prototype.mousePoint = function (e) {
            var p = new TileMap.Point(e.pageX, e.pageY);
            var node = this._canvas;
            while (node != null) {
                p.x -= node.offsetLeft;
                p.y -= node.offsetTop;
                node = node.offsetParent;
            }
            p.translate(-this._translate.x, -this._translate.y);
            return p;
        };
        Map.prototype.groundTileAtPoint = function (p) {
            for (var key in this._groundLayer.tiles) {
                var tile = this._groundLayer.tiles[key];
                if (tile.contains(p)) {
                    return tile;
                }
            }
            return null;
        };
        Map.prototype.fillTileWithAsset = function (tile) {
            console.log("will fill tile " + tile.id);
            tile.asset = this.selectedAsset;
            this.draw();
        };
        Map.prototype.mouseDown = function (e) {
            this._isMouseDown = true;
            this._p1 = this.mousePoint(e);
            if (this._mode === MapMode.Pan || this._maskLayer.highlightedTile == null) {
                return;
            }
            if (this.selectedAsset == null) {
                var heightTile = this._heightLayer.tiles[this._maskLayer.highlightedTile.id];
                if (heightTile != null) {
                    delete this._heightLayer.tiles[this._maskLayer.highlightedTile.id];
                }
                this._maskLayer.selectedTile = this._maskLayer.highlightedTile;
                this._maskLayer.selectedTile.asset = null;
            }
            else if (this.selectedAsset.type === TileMap.AssetType.Height) {
                var heightTile = this._heightLayer.tiles[this._maskLayer.highlightedTile.id];
                if (heightTile == null) {
                    heightTile = this._maskLayer.highlightedTile.clone();
                    this._heightLayer.tiles[heightTile.id] = heightTile;
                }
                heightTile.asset = this.selectedAsset;
            }
            else {
                var groundTile = this._groundLayer.tiles[this._maskLayer.highlightedTile.id];
                groundTile.asset = this.selectedAsset;
            }
            this.draw();
        };
        Map.prototype.mouseUp = function (e) {
            this._isMouseDown = false;
            console.log(this.toJson());
        };
        Map.prototype.mouseMove = function (e) {
            e.preventDefault();
            var p2 = this.mousePoint(e);
            if (this._isMouseDown) {
                if (this._mode === MapMode.Pan) {
                    var diffx = p2.x - this._p1.x;
                    var diffy = p2.y - this._p1.y;
                    this.dmove(diffx, diffy);
                }
                else {
                    var tile = this.groundTileAtPoint(p2);
                    if (tile != null) {
                        this.fillTileWithAsset(tile.clone());
                    }
                }
            }
            else {
                var tile = this.groundTileAtPoint(p2);
                if (tile == null) {
                    this._maskLayer.highlightedTile = null;
                    this.drawMaskLayer();
                }
                else {
                    var hTile = tile.clone();
                    if (this._maskLayer.highlightedTile == null || hTile.id != this._maskLayer.highlightedTile.id) {
                        this._maskLayer.highlightedTile = hTile;
                        this.drawMaskLayer();
                    }
                }
            }
        };
        Map.prototype.toJson = function () {
            return JSON.stringify({
                layers: [this._groundLayer.toJsonObj(), this._heightLayer.toJsonObj()]
            });
        };
        return Map;
    }());
    TileMap.Map = Map;
})(TileMap || (TileMap = {}));
var TileMap;
(function (TileMap) {
    var MaskLayer = (function () {
        function MaskLayer(width, height) {
            this._highlightedTile = null;
            this._selectedTile = null;
            this._translate = new TileMap.Point(0, 0);
            this._highlightedTileDawStyle = {
                fillStyle: "rgba(200, 100, 100, 0.3)",
                strokeStyle: "rgba(0, 0, 200, 0.3)",
                strokeWidth: 1.0,
                useAsset: false
            };
            this._selectedTileDawStyle = {
                fillStyle: "rgba(200, 100, 100, 0.3)",
                strokeStyle: "rgba(255, 255, 0, 0.8)",
                strokeWidth: 3.0,
                useAsset: false
            };
            this._selectedTileAssetDawStyle = {
                fillStyle: "rgba(200, 100, 100, 0.1)",
                strokeStyle: "rgba(10, 10, 220, 0.2)",
                strokeWidth: 1.0,
                useAsset: true
            };
            this._canvas = document.createElement("canvas");
            this._canvas.width = width;
            this._canvas.height = height;
            this._context = this._canvas.getContext("2d");
            this._context.scale(TileMap.Util.devicePixelRatio, TileMap.Util.devicePixelRatio);
        }
        Object.defineProperty(MaskLayer.prototype, "highlightedTile", {
            get: function () {
                return this._highlightedTile;
            },
            set: function (tile) {
                this._highlightedTile = tile;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MaskLayer.prototype, "selectedTile", {
            get: function () {
                return this._selectedTile;
            },
            set: function (tile) {
                this._selectedTile = tile;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MaskLayer.prototype, "highlightedDrawStyle", {
            set: function (style) {
                this._highlightedTileDawStyle = style;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MaskLayer.prototype, "selectedDrawStyle", {
            set: function (style) {
                this._selectedTileDawStyle = style;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MaskLayer.prototype, "translate", {
            set: function (translate) {
                this._translate = translate;
            },
            enumerable: true,
            configurable: true
        });
        MaskLayer.prototype.clear = function () {
            this._context.save();
            this._context.translate(0, 0);
            this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            this._context.restore();
        };
        MaskLayer.prototype.draw = function () {
            this._context.save();
            this._context.translate(this._translate.x, this._translate.y);
            if (this.selectedTile != null) {
                if (this.selectedTile.asset == null) {
                    this.selectedTile.draw(this._context, this._selectedTileDawStyle);
                }
                else {
                    this._context.shadowBlur = 20;
                    this._context.shadowColor = "black";
                    this.selectedTile.draw(this._context, this._selectedTileAssetDawStyle);
                }
            }
            if (this.highlightedTile != null && this.highlightedTile != this.selectedTile) {
                this.highlightedTile.draw(this._context, this._highlightedTileDawStyle);
            }
            this._context.restore();
            return this._canvas;
        };
        return MaskLayer;
    }());
    TileMap.MaskLayer = MaskLayer;
})(TileMap || (TileMap = {}));
var TileMap;
(function (TileMap) {
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        Point.prototype.translate = function (x, y) {
            this.x = this.x + x;
            this.y = this.y + y;
        };
        return Point;
    }());
    TileMap.Point = Point;
})(TileMap || (TileMap = {}));
var TileMap;
(function (TileMap) {
    var Size = (function () {
        function Size(width, height) {
            this.width = width;
            this.height = height;
        }
        return Size;
    }());
    TileMap.Size = Size;
})(TileMap || (TileMap = {}));
var TileMap;
(function (TileMap) {
    var Tile = (function () {
        function Tile(centerX, centerY, width, height, isometric) {
            this._isometric = false;
            this._centerX = centerX;
            this._centerY = centerY;
            this._isometric = isometric;
            if (!isometric) {
                this._shape = [
                    new TileMap.Point(centerX - width / 2.0, centerY - height / 2.0),
                    new TileMap.Point(centerX + width / 2.0, centerY - height / 2.0),
                    new TileMap.Point(centerX + width / 2.0, centerY + height / 2.0),
                    new TileMap.Point(centerX - width / 2.0, centerY + height / 2.0)
                ];
            }
            else {
                this._shape = [
                    new TileMap.Point(centerX, centerY - height / 2.0),
                    new TileMap.Point(centerX + width / 2.0, centerY),
                    new TileMap.Point(centerX, centerY + height / 2.0),
                    new TileMap.Point(centerX - width / 2.0, centerY)
                ];
            }
            this._startPoint = new TileMap.Point(centerX - width / 2.0, centerY - height / 2.0);
            this._size = new TileMap.Size(width, height);
        }
        Object.defineProperty(Tile.prototype, "id", {
            get: function () {
                return this._id;
            },
            set: function (id) {
                this._id = id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "asset", {
            set: function (asset) {
                this._asset = asset;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "startPoint", {
            get: function () {
                return this._startPoint;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tile.prototype, "size", {
            get: function () {
                return this._size;
            },
            enumerable: true,
            configurable: true
        });
        Tile.prototype.contains = function (point) {
            return TileMap.Util.isPointInPoly(this._shape, point);
        };
        Tile.prototype.draw = function (context, drawStyle) {
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
            if (this._asset != null && drawStyle.useAsset) {
                context.drawImage(this._asset.image, this.startPoint.x, this.startPoint.y - this._asset.image.height + this._size.height, this._size.width, this._asset.image.height);
            }
        };
        Tile.prototype.clone = function () {
            var tile = new Tile(this._centerX, this._centerY, this._size.width, this._size.height, this._isometric);
            tile._id = this._id;
            tile._asset = this._asset;
            return tile;
        };
        Tile.prototype.toJsonObj = function () {
            return {
                id: this._id,
                asset: this._asset == null ? null : this._asset.id
            };
        };
        return Tile;
    }());
    TileMap.Tile = Tile;
})(TileMap || (TileMap = {}));
var TileMap;
(function (TileMap) {
    var TileLayer = (function () {
        function TileLayer(width, height) {
            this._tiles = {};
            this._translate = new TileMap.Point(0, 0);
            this._drawStyle = {
                fillStyle: null,
                strokeStyle: null,
                strokeWidth: 0,
                useAsset: true
            };
            this._canvas = document.createElement("canvas");
            this._canvas.width = width;
            this._canvas.height = height;
            this._context = this._canvas.getContext("2d");
            this._context.scale(TileMap.Util.devicePixelRatio, TileMap.Util.devicePixelRatio);
        }
        Object.defineProperty(TileLayer.prototype, "tiles", {
            get: function () {
                return this._tiles;
            },
            set: function (tiles) {
                this._tiles = tiles;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TileLayer.prototype, "translate", {
            set: function (translate) {
                this._translate = translate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TileLayer.prototype, "drawStyle", {
            set: function (drawStyle) {
                this._drawStyle = drawStyle;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TileLayer.prototype, "image", {
            get: function () {
                return this._canvas;
            },
            enumerable: true,
            configurable: true
        });
        TileLayer.prototype.clear = function () {
            this._context.save();
            this._context.translate(0, 0);
            this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            this._context.restore();
        };
        TileLayer.prototype.draw = function () {
            this._context.save();
            this._context.translate(this._translate.x, this._translate.y);
            for (var key in this._tiles) {
                var tile = this._tiles[key];
                tile.draw(this._context, this._drawStyle);
            }
            this._context.restore();
            return this._canvas;
        };
        TileLayer.prototype.toJsonObj = function () {
            var _this = this;
            return {
                tiles: Object.keys(this._tiles).map(function (key) { return _this._tiles[key].toJsonObj(); })
            };
        };
        return TileLayer;
    }());
    TileMap.TileLayer = TileLayer;
})(TileMap || (TileMap = {}));
var TileMap;
(function (TileMap) {
    var Util = (function () {
        function Util() {
        }
        Util.isPointInPoly = function (poly, pt) {
            for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
                ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
                    && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
                    && (c = !c);
            return c;
        };
        Object.defineProperty(Util, "devicePixelRatio", {
            get: function () {
                return (('devicePixelRatio' in window) && (window.devicePixelRatio > 1)) ? window.devicePixelRatio : 1;
            },
            enumerable: true,
            configurable: true
        });
        return Util;
    }());
    TileMap.Util = Util;
})(TileMap || (TileMap = {}));
