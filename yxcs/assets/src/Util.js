
module.exports = {
    //将像素坐标转化为瓦片坐标，posInPixel：目标节点的position，地图锚点方式00:以0点为准,05以0.5为准
    getTilePos: function (posInPixel, mapComponent, anthorType) {
        if (anthorType == "00") {
            var mapSize = mapComponent.node.getContentSize();
            var tileSize = mapComponent.getTileSize();
            var x = Math.floor(posInPixel.x / tileSize.width);
            var y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);
        } else if (anthorType == "05") {
            var mapSize = mapComponent.node.getContentSize();
            var tileSize = mapComponent.getTileSize();

            var x = Math.floor((posInPixel.x + mapSize.width / 2) / tileSize.width);
            var y = Math.floor((mapSize.height - (posInPixel.y + mapSize.height / 2)) / tileSize.height);

        }
        return cc.p(x, y);
    },


    // update (dt) {},
};
