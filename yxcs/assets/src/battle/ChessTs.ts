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
    public chessType=99;

    @property(Boolean)
    private crossing=false;

    @property(cc.Prefab)
    public  myExplode;



    private _getRandomNum(min,max){
        return Math.floor(Math.random() * (max - min + 1) + min);
     }

    onLoad () 
    {
        var self=this;
        
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
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
                self.node.setPosition(BattleGlobalTs.newPos);
                BattleGlobalTs.newPos = null;
                BattleGlobalTs.oldPos = null;
            } else
            {
                self.node.setPosition(self.getComponent("ChessTs").initPos);
            }
            if (BattleGlobalTs.isAlreadyCollision)
            {
                BattleGlobalTs.currentStep = BattleGlobalTs.myStep.GETRESULT_STEP;
                BattleGlobalTs.isAlreadyCollision = false;
               cc.find("Canvas").getComponent("BattleManagerTs").doGetResultAndMovingDownStep();
            }

         },this);



    }
 
 
    onCollisionEnter (other,self)
    {
       
        if(this.node.name!=BattleGlobalTs.snapName)
        {

            return;
        }
        if (!this.crossing){
        
            BattleGlobalTs.oldPos = self.getComponent("ChessTs").initPos;
            BattleGlobalTs.newPos = other.getComponent("ChessTs").initPos;

            this.node.getComponent("ChessTs").initPos = BattleGlobalTs.newPos;        
            
            other.node.setPosition(BattleGlobalTs.oldPos);
            other.getComponent("ChessTs").initPos = BattleGlobalTs.oldPos;
    
            this.crossing = true;
            BattleGlobalTs.isAlreadyCollision = true;
        }
    }

    onCollisionExit(other,self)
    {

        this.crossing=false;
    }
  public  destroySelf () {
        var self=this;
        var actionArray = new Array();
        var destroyEffectCallFunc = cc.callFunc( ()=> {
            var board = cc.find("Canvas/chessBoard");
            var particleNode = cc.instantiate(self.myExplode);
            particleNode.name="particle_texture";
            particleNode.setPosition(this.node.getPosition());
            board.addChild(particleNode);

        }, this);
      //  var destroyDelay = cc.delayTime(BattleGlobalTs.DESTROY_DELAY_TIME);
        var destroyCallFunc = cc.callFunc( ()=>{

            self.node.destroy();
        },this);
        
        actionArray.push(destroyEffectCallFunc);
        actionArray.push(destroyCallFunc);
        //actionArray.push(destroyDelay);
        this.node.runAction(cc.sequence(actionArray));
       
    }

}
