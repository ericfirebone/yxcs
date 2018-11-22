var ChessType = cc.Enum({
    BLUE: 0,
    GREEN: 1,
    RED: 2,
    DARK: 3,
    LIGHT: 4,
    HEART: 5,
    STRONGBLUE: 6,
    STRONGGREEN: 7,
    STRONGRED: 8,
    STRONGDARK: 9,
    STRONGLIGHT: 10,
    STRONGHEART: 11,
});
var myStep = cc.Enum({
    PREPARE_STEP: 0,//prepare to move chess step
    MOVING_STEP: 1,//in moving chess step
    GETRESULT_STEP: 2,//move finish and rooling to find could destory chess 
    DESTROY_STEP: 3,//destory finish move down and create new chess to fill the blank
    EXEC_DESTROY_STEP: 4,//execute destroy step
    MOVING_DOWN_STEP: 5,//fall down and fill board then back to step destroy
    JUDGE_FALLDOWN_POSMAP_STEP: 6,//local pos-name posmap before falldown
    EXEC_FALLDOWN_STEP: 7,//excute falldown 
    CREATE_NEW_CHESS_STEP: 8,//create new chess
    WAIT_FORFILL_STEP: 9,//wait chess fill all the board
    JUDGE_DAMGE_HEAL_STEP: 10,//the calculate damage and heal step
    MOVING_STEP: 11,//moving to next stage
    GAME_RESULT_STEP: 12,//to get game result (game over or win)
    GAME_PAUSE_STEP: 99//pause
});
cc.Class({
    extends: cc.Component,

    properties: {
        propagate: { default: false },
        initPos: null,
        alreadyCross: false,
        chessType:99,
        spriteList:
        {
            default: [],
            type: [cc.SpriteFrame]
        },
        myExplode: {//自身爆炸效果
            default: null,
            type: [cc.Prefab]
        },
      //  coordinate:null,//坐标
    },
  
    _getRandomNum:function(min,max){

       return Math.floor(Math.random() * (max - min + 1) + min);
    },
  
  
    onLoad() {
        cc.director.getCollisionManager().enabled = true;
       // cc.director.getCollisionManager().enabledDebugDraw = true;
        //set color type
        var myType = this._getRandomNum(0, 5);
      
        switch (myType)
        {
            case ChessType.BLUE:
                this.getComponent(cc.Sprite).spriteFrame = this.spriteList[0];
                this.chessType = 0;
            break;
            case ChessType.GREEN:
                this.getComponent(cc.Sprite).spriteFrame = this.spriteList[1];
                this.chessType = 1;
            break;
            case ChessType.RED:
                this.getComponent(cc.Sprite).spriteFrame = this.spriteList[2];
                this.chessType = 2;
            break;
            case ChessType.DARK:
                this.getComponent(cc.Sprite).spriteFrame = this.spriteList[3];
                this.chessType = 3;
            break;
            case ChessType.LIGHT:
                this.getComponent(cc.Sprite).spriteFrame = this.spriteList[4];
                this.chessType = 4;
                break;
            case ChessType.HEART:
                this.getComponent(cc.Sprite).spriteFrame = this.spriteList[5];
                this.chessType = 5;
            break;
       
        }
        //set size
        let size2 = cc.winSize;
        this.node.width = parseInt((size2.width - 20) / 6);
        this.node.height = this.node.width;
     
        this.node.on(cc.Node.EventType.TOUCH_START, function () {
         //   cc.log('Drag stated ...');
           
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {

            if (G.currentStep == myStep.PREPARE_STEP) {
                G.snapTag = this.node.getComponent(cc.BoxCollider).Tag;
                let touch = event.getTouches()[0];
                let board = cc.find("Canvas/chessBoard");
                let vec = cc.find("Canvas/chessBoard").convertTouchToNodeSpaceAR(touch);
               // cc.log(G.snapTag);
                //检查X轴是否越界
                if (vec.x + this.node.width / 2 > board.width / 2 || vec.x - this.node.width / 2 < -board.width / 2) {
                    this.node.x = vec.x < 0 ? -board.width / 2 + this.node.width / 2 : board.width / 2 - this.node.width / 2;
                } else {
                    this.node.x = vec.x;
                }
                //检查Y轴是否越界
                if (vec.y + this.node.height / 2 > board.height / 2 || vec.y - this.node.height / 2 < -board.height / 2) {
                    this.node.y = vec.y < 0 ? -board.height / 2 + this.node.height / 2 : board.height / 2 - this.node.height / 2;
                } else {
                    this.node.y = vec.y;
                }
                /*var delta = event.touch.getDelta();
                this.x += delta.x;
                this.y += delta.y;
                if (this.getComponent("chess").propagate) {
                    event.stopPropagation();
                }*/


            }
            


        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, function () {
            //      this.opacity = 160;
            if (G.newPos != null) {
                this.node.setPosition(G.newPos);
                G.newPos = null;
                G.oldPos = null;
            } else
            {
                this.node.setPosition(this.initPos);
            }
            if (G.crossFlag)
            {
                G.currentStep = myStep.GETRESULT_STEP;
                G.crossFlag = false;
                cc.find("Canvas").getComponent("battleManager").doGetResultAndMovingDownStep();
            }
        }, this);

    },

    onDisabled: function () {
        cc.director.getCollisionManager().enabled = false;
        cc.director.getCollisionManager().enabledDebugDraw = false;
    },
    
    //update(dt) {
     
    //},
    destroySelf: function () {
        var actionArray = new Array();
        var destroyEffectCallFunc = cc.callFunc(function () {
            var board = cc.find("Canvas/chessBoard");
            var particleNode = cc.instantiate(this.myExplode);
            particleNode.setPosition(this.node.getPosition());
            board.addChild(particleNode);

        }, this);
        var destroyDelay = cc.delayTime(G.DESTROY_DELAY_TIME);
        var destroyCallFunc = cc.callFunc(function () {

            this.node.destroy();
        },this);
        
        actionArray.push(destroyEffectCallFunc);
        actionArray.push(destroyCallFunc);
        actionArray.push(destroyDelay);
          this.node.runAction(cc.sequence(actionArray));
       // return actionArray;
    },
    onCollisionEnter: function (other, self)
    {
     //   cc.log("enter collision");
        if (this.node.getComponent(cc.BoxCollider).Tag != G.snapTag)
        {
            return;
        }
     
        // 1st step 
        // get pre aabb, go back before collision
        var otherAabb = other.world.aabb;
        var otherPreAabb = other.world.preAabb.clone();

        var selfAabb = self.world.aabb;
        var selfPreAabb = self.world.preAabb.clone();
       // cc.log("cc.Intersection.rectRect(selfPreAabb, otherPreAabb):" + cc.Intersection.rectRect(selfPreAabb, otherPreAabb));
        if (!this.alreadyCross){
            G.oldPos = self.getComponent("chess").initPos;
            G.newPos = other.getComponent("chess").initPos;
            self.getComponent("chess").initPos = window.G.newPos;
            // self.setPosition(newPos);
            other.node.setPosition(G.oldPos);
            other.getComponent("chess").initPos = window.G.oldPos;
            this.alreadyCross = true;
            window.G.crossFlag = true;
        }
    },
    onCollisionExit: function (other, self)
    {
        this.alreadyCross = false;
    },
   
});
