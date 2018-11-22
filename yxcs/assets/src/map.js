

cc.Class({
    extends: cc.Component,

    properties: {
        player: {
            default: null,
            type: cc.Node,
            displayName: '地图的主角',

        },
    },

    onLoad: function () {
        this.player = this.node.getChildByName('player');
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (keyCode, event) {
                var newTile = cc.p(self.playerTile.x, self.playerTile.y);
                switch (keyCode) {
                    case cc.KEY.up:
                        newTile.y -= 1;
                        break;
                    case cc.KEY.down:
                        newTile.y += 1;
                        break;
                    case cc.KEY.left:
                        newTile.x -= 1;
                        break;
                    case cc.KEY.right:
                        newTile.x += 1;
                        break;
                    default:
                        return;
                }

                self.tryMoveToNewTile(newTile);

            }
        }, self);
    },



    tryMoveToNewTile: function (newTile) {
        var mapSize = this.tiledMap.getMapSize();
        if (newTile.x < 0 || newTile.x >= mapSize.width) return;
        if (newTile.y < 0 || newTile.y >= mapSize.height) return;

        if (this.barriers.getTileGIDAt(newTile)) {//GID=0,则该Tile为空
            cc.log('This way is blocked!');
            return false;
        }

        this.tryCatchStar(newTile);

        this.playerTile = newTile;
        this.updatePlayerPos();

        if (cc.pointEqualToPoint(this.playerTile, this.endTile)) {
            cc.log('succeed');
        }
    },

    tryCatchStar: function (newTile) {
        var GID = this.stars.getTileGIDAt(newTile);
        var prop = this.tiledMap.getPropertiesForGID(GID);
        if (prop.isStar) {
            this.stars.removeTileAt(newTile);
        }
    },

    //加载地图文件时调用
    loadMap: function () {
        //初始化地图位置
       // this.node.setPosition(cc.visibleRect.bottomLeft);
        //地图
        this.tiledMap = this.node.getComponent(cc.TiledMap);
        //players对象层
        //var players = this.tiledMap.getObjectGroup('players');
        //startPoint和endPoint对象
        //var startPoint = players.getObject('startPoint');
      //  var endPoint = players.getObject('endPoint');
        //像素坐标
        //var startPos = cc.p(startPoint.x, startPoint.y);
       // var endPos = cc.p(endPoint.x, endPoint.y);
        //障碍物图层和星星图层
       // this.barriers = this.tiledMap.getLayer('barriers');
       // this.stars = this.tiledMap.getLayer('stars');
        //出生Tile和结束Tile
       // this.playerTile = this.startTile = this.getTilePos(startPos);
        //this.endTile = this.getTilePos(endPos);
        //更新player位置
        this.updatePlayerPos();

    },

    //将像素坐标转化为瓦片坐标
    getTilePos: function (posInPixel) {
        var mapSize = this.node.getContentSize();
        var tileSize = this.tiledMap.getTileSize();
        var x = Math.floor(posInPixel.x / tileSize.width);
        var y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);
        return cc.p(x, y);
    },


    updatePlayerPos: function () {
        var pos = this.barriers.getPositionAt(this.playerTile);
        this.player.setPosition(pos);
    },

});
