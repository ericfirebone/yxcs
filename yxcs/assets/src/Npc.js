var util = require('Util');
cc.Class({
    extends: cc.Component,

    properties: {
      
        _hero:
        {
            default: null,
            type: cc.Node,
       
        },
        _tip:
        {
            default: null,
            type: cc.Label,


        },
        observe:
        {
            default: true,
            displayName:"可否查看",
        },
        chat:
        {
            default: true,
            displayName:"可否交谈",
        },
        battle:
        {
            default: true,
            displayName:"可否战斗",
        },  
        apprentice:
        {
            default: false,
            displayName:"可否拜师",
        },
        consult:
        {
            default: false,
            displayName: "可否请教",
        }
    },

   

    onLoad () {
       // var pos = util.getTilePos(this.node.position, this.ground.getComponent(cc.TiledMap), "05");
       // cc.log("pos:"+pos);
       // tiledLayer.setTileGID(1001, 10, 10, 1);
        var self = this;
        self._hero = cc.find("Canvas/hero");
        self._tip = cc.find("Canvas/UI/tip");
        var npcMenu = cc.find("Canvas/UI/npcMenu");
        if (!this.observe)
        {
            npcMenu.children[0].active = false;

        }
        if (!this.chat) {
            npcMenu.children[1].active = false;

        }
        if (!this.battle) {
            npcMenu.children[2].active = false;

        }
        if (!this.apprentice) {
            npcMenu.children[3].active = false;

        }
        if (!this.consult) {
            npcMenu.children[4].active = false;

        }
        this._tip.active = false;
        self.node.on(cc.Node.EventType.TOUCH_START, this._touchStartEvent, self);
    },

    _touchStartEvent: function ()
    {
       var faraway = 64;
      
        if (Math.abs(this._hero.x - this.node.x) > faraway || Math.abs(this._hero.y - this.node.y) > faraway) {
            cc.log(214214);
            this._tip.active = true;
            this._tip.setPosition(0, 256);
            this._tip.getComponent(cc.Label).string = "你离得太远了,请靠近一些";
          //  cc.director.getScheduler().schedule(this._tipHide, this._tip, 1, 0, 3);
            var seq = cc.sequence(cc.fadeIn(0.1), cc.moveTo(3, cc.p(this._tip.x, this._tip.y + 15)), cc.fadeOut(0.5));
            this._tip.runAction(seq);
          
        } else
        {
            var npcMenu = cc.find("Canvas/UI/npcMenu");
            npcMenu.active = true;

        }

    },
    _tipHide: function ()
    {
        this._tip = cc.find("Canvas/UI/tip");
        this._tip.active = false;
    }
});
