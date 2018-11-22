import {BattleGlobalTs} from "./BattleGlobalTs";
const {ccclass, property} = cc._decorator;


@ccclass
export default class Chess extends cc.Component {

    @property(cc.Enum)
    private ChessType = cc.Enum({
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

    @property(cc.Integer)
    private maxTypeCount=5;

    @property([cc.SpriteFrame])
    private spriteList=[];

    @property(cc.Vec2)
    public initPos;

    @property( [cc.Integer])
    private chessType=99;

    @property(Boolean)
    private alreadyCross=false;

    private _getRandomNum(min,max){
        return Math.floor(Math.random() * (max - min + 1) + min);
     }

    onLoad () 
    {
        var self=this;
        
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
        var myType = this._getRandomNum(0, this.maxTypeCount);

        switch(myType)
        {
            case this.ChessType.BLUE:
                this.getComponent(cc.Sprite).spriteFrame = this.spriteList[0];
                this.chessType = 0;
            break;
            case this.ChessType.GREEN:
                this.getComponent(cc.Sprite).spriteFrame = this.spriteList[1];
                this.chessType = 1;
            break;
            case this.ChessType.RED:
                this.getComponent(cc.Sprite).spriteFrame = this.spriteList[2];
                this.chessType = 2;
            break;
            case this.ChessType.DARK:
                this.getComponent(cc.Sprite).spriteFrame = this.spriteList[3];
                this.chessType = 3;
            break;
            case this.ChessType.LIGHT:
                this.getComponent(cc.Sprite).spriteFrame = this.spriteList[4];
                this.chessType = 4;
                break;
            case this.ChessType.HEART:
                this.getComponent(cc.Sprite).spriteFrame = this.spriteList[5];
                this.chessType = 5;
            break;
        }

         //set size
         this.node.width  = cc.winSize.width  /6;
         this.node.height = this.node.width;

         this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
           if(BattleGlobalTs.currentStep==BattleGlobalTs.myStep.PREPARE_STEP)
           {
              BattleGlobalTs.snapName=self.node.name;
              let touch = event.getTouches()[0];
              let board = cc.find("Canvas/chessBoard");
              let localTouch = cc.find("Canvas/chessBoard").convertTouchToNodeSpaceAR(touch);
             if(localTouch.x+self.node.width/2<board.width&&localTouch.x>self.node.width/2)
             {
                self.node.x=localTouch.x;

             }
             if(localTouch.y+self.node.height/2<board.height&&localTouch.y>self.node.height/2)
             {
                self.node.y=localTouch.y;

             }  
           }
         },this);

         this.node.on(cc.Node.EventType.TOUCH_END,function(event){

            if (BattleGlobalTs.newPos != null) {
                this.node.setPosition(BattleGlobalTs.newPos);
                BattleGlobalTs.newPos = null;
                BattleGlobalTs.oldPos = null;
            } else
            {
                this.node.setPosition(this.initPos);
            }
            if (BattleGlobalTs.crossFlag)
            {
                BattleGlobalTs.currentStep = BattleGlobalTs.myStep.GETRESULT_STEP;
                BattleGlobalTs.crossFlag = false;
                cc.find("Canvas").getComponent("battleManager").doGetResultAndMovingDownStep();
            }

         },this);



    }
    onEnable()
    {
        cc.director.getCollisionManager().enabled = true;

    }
   /* onDisabled () {
        cc.director.getCollisionManager().enabled = false;
        cc.director.getCollisionManager().enabledDebugDraw = false;
    }*/
    onCollisionEnter(other,self)
    {
        cc.log("32113123");
      /*  if(this.node.name!=BattleGlobalTs.snapName)
        {

            return;
        }
        if (!this.alreadyCross){
            BattleGlobalTs.oldPos = self.getComponent("chess").initPos;
            BattleGlobalTs.newPos = other.getComponent("chess").initPos;
            self.getComponent("chess").initPos = BattleGlobalTs.newPos;
            // self.setPosition(newPos);
            other.node.setPosition(BattleGlobalTs.oldPos);
            other.getComponent("chess").initPos = BattleGlobalTs.oldPos;
            this.alreadyCross = true;
            BattleGlobalTs.crossFlag = true;
        }*/
    }

    onCollisionExit(other,self)
    {
        cc.log("collision  exit");
      /*  this.alreadyCross=false;*/
    }
   

}
