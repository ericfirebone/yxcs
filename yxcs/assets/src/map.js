

cc.Class({
    extends: cc.Component,

    properties: {
        player: {
            default: null,
            type: cc.Node,
            displayName: '��ͼ������',

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

        if (this.barriers.getTileGIDAt(newTile)) {//GID=0,���TileΪ��
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

    //���ص�ͼ�ļ�ʱ����
    loadMap: function () {
        //��ʼ����ͼλ��
       // this.node.setPosition(cc.visibleRect.bottomLeft);
        //��ͼ
        this.tiledMap = this.node.getComponent(cc.TiledMap);
        //players�����
        //var players = this.tiledMap.getObjectGroup('players');
        //startPoint��endPoint����
        //var startPoint = players.getObject('startPoint');
      //  var endPoint = players.getObject('endPoint');
        //��������
        //var startPos = cc.p(startPoint.x, startPoint.y);
       // var endPos = cc.p(endPoint.x, endPoint.y);
        //�ϰ���ͼ�������ͼ��
       // this.barriers = this.tiledMap.getLayer('barriers');
       // this.stars = this.tiledMap.getLayer('stars');
        //����Tile�ͽ���Tile
       // this.playerTile = this.startTile = this.getTilePos(startPos);
        //this.endTile = this.getTilePos(endPos);
        //����playerλ��
        this.updatePlayerPos();

    },

    //����������ת��Ϊ��Ƭ����
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
