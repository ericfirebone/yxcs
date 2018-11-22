
cc.Class({
    extends: cc.Component,

    properties: {
        dir: "n",
        dot: {
            default: null,
            type: cc.Node,
            displayName: 'Ò¡¸Ë½Úµã',
        },
    },

    onLoad: function () {
        cc.director.getCollisionManager().enabled = true;
       // cc.director.getCollisionManager().enabledDebugDraw = true;
    },

    changeDirection: function (dir)
    {
        if (dir==null)
        {
            return;
        }
        switch (dir)
        {
            case "u":
                this.getComponent(cc.Animation).play("u");
                break;
            case "d":
                this.getComponent(cc.Animation).play("d");
                break;
            case "l":
                this.getComponent(cc.Animation).play("l");
                break;
            case "r":
                this.getComponent(cc.Animation).play("r");
                break;
            case "su":
                this.getComponent(cc.Animation).play("su");
                break;
            case "sd":
                this.getComponent(cc.Animation).play("sd");
                break;
            case "sl":
                this.getComponent(cc.Animation).play("sl");
                break;
            case "sr":
                this.getComponent(cc.Animation).play("sr");
                break;
        }

    },

    onCollisionEnter: function (other, self) {
     
        var otherAabb = other.world.aabb;
        var otherPreAabb = other.world.preAabb.clone();

        var selfAabb = self.world.aabb;
        var selfPreAabb = self.world.preAabb.clone();

    
        selfPreAabb.x = selfAabb.x;
        otherPreAabb.x = otherAabb.x;
      
            if ( (selfPreAabb.xMax > otherPreAabb.xMax)) {
                //  this.node.x = otherPreAabb.xMax - this.node.parent.x + selfPreAabb.width;
                this.dot.getComponent("JoystickBG").lbool = false;
            }
            if ( (selfPreAabb.xMin < otherPreAabb.xMin)) {
             //   this.node.x = otherPreAabb.xMin - selfPreAabb.width - this.node.parent.x;
                this.dot.getComponent("JoystickBG").rbool = false;
            } 
            if ((selfPreAabb.yMax > otherPreAabb.yMax)) {
                //   this.node.y = otherPreAabb.yMax - this.node.parent.y + selfPreAabb.height;
                this.dot.getComponent("JoystickBG").dbool = false;
            }
             if ((selfPreAabb.yMin < otherPreAabb.yMin)) {
                 //  this.node.y = otherPreAabb.yMin - selfPreAabb.height - this.node.parent.y;
                 this.dot.getComponent("JoystickBG").ubool = false;
            }

    },
    onCollisionExit: function (other, self) {
        this.dot.getComponent("JoystickBG").lbool = true;
        this.dot.getComponent("JoystickBG").rbool = true;
        this.dot.getComponent("JoystickBG").dbool = true;
        this.dot.getComponent("JoystickBG").ubool = true;
    }
});
