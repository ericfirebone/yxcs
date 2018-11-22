cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello, World!'
    },

    // use this for initialization
    onLoad: function () {
        this.label.string = this.text;
        var size = cc.winSize;
       //  var helloLabel = new cc.LabelTTF("game scene", "Arial", 38);
      //   helloLabel.parent = this.node;
       //  helloLabel.setPosition(0, 0);
        //helloLabel.x = size.width / 2;
      //  helloLabel.y = size.height / 2 + 200;
      //  this.addChild(helloLabel,5);

        var n = new cc.Node('sprite ' + this.count);
        //  var sp = node.addComponent(cc.Sprite);
        var lb = n.addComponent(cc.Label);
        lb.string = "click change";
        
      //  sp.spriteFrame = this.sprite;
        n.parent = this.node;
        n.setPosition(0, 0);
     //   n.on('click', this.toScene, this);
        n.on('mousedown', function (event) {
            console.log('Mouse down');
        }, this);
    },

    // called every frame
    update: function (dt) {

    },
    toScene: function (event) {
        cc.director.loadScene("zjj")
    },
    prt: function (event)
    {
        cc.log("241432544");
    }
});
