
module.exports = {
    //����������ת��Ϊ��Ƭ���꣬posInPixel��Ŀ��ڵ��position����ͼê�㷽ʽ00:��0��Ϊ׼,05��0.5Ϊ׼
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
