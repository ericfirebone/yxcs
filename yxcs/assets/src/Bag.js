
cc.Class({
    extends: cc.Component,

    properties: {
        itemPrefab:
            {
                default:null,
                type:cc.Prefab
            },
        _itemCount:0,
      
       
    },
   
    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        //cc.loader.loadRes("test assets/sheep", cc.SpriteAtlas, function (err, atlas) {
        //    var frame = atlas.getSpriteFrame('sheep_down_0');
        //    sprite.spriteFrame = frame;
        // });
        this._itemCount = 133;
        var itemHeight = 20;
        var itemMargin = 20;
        var heightFixed = 0;
        this.node.parent.setContentSize(cc.size(this.node.width,heightFixed+ this._itemCount * (itemHeight + itemMargin) / (this.node.width / (itemHeight + itemMargin))));
        for (var i = 0; i < this._itemCount; i++)
        {
            var bagItem = cc.instantiate(this.itemPrefab);
            
            this.node.addChild(bagItem);
        }
    },

});
