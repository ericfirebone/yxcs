import { GlobalVariable } from '../util/GlobalTs';
import {BattleGlobalTs} from "./BattleGlobalTs";
const {ccclass, property} = cc._decorator;

@ccclass
export default class BattleManager extends cc.Component {

    @property(cc.Integer)
    public col=6;

    @property(cc.Integer)
    public row=6;

    @property(cc.Prefab)
    private chessBg;

    @property([cc.SpriteFrame])
    private chessBgFrameList=[];

    @property(cc.Prefab)
    private chess;

    @property([cc.Vec2])
    public positionList;

    @property(cc.Float)
    public chessOffset=10;

 
     onLoad()
    {
     
    
      //init Canvas
      this.node.width=cc.winSize.width;
      this.node.height=cc.winSize.height;

      //init chessBoard
      var chessBoard=this.node.getChildByName("chessBoard"); 
      chessBoard.width=this.node.width;
      chessBoard.height=chessBoard.width;

      //init positionList
      var widthOffset=chessBoard.width/(this.col);
      var heightOffset=chessBoard.width/(this.row);

      for(var i=0;i<this.col;i++)
      {
        for(var j=0;j<this.row;j++)
        {

        var v=new cc.Vec2(widthOffset*(i),heightOffset*(j));
        this.positionList.push(v);
        
        //init chessBg into chessBoard
        var chessBg=cc.instantiate(this.chessBg);
    
        chessBg.width=cc.winSize.width/this.col;
        chessBg.height= chessBg.width;
        chessBg.x=v.x;
        chessBg.y=v.y;
      
        if (i % 2 == 0 || i == 0) {
          if (j % 2 == 0 || j == 0) {
              chessBg.getComponent(cc.Sprite).spriteFrame = this.chessBgFrameList[0];
          }
          else if (j % 2 == 1 || j == 1) {
              chessBg.getComponent(cc.Sprite).spriteFrame = this.chessBgFrameList[1];
          }
      }
      else if (i % 2 == 1 || i == 1) {
          if (j % 2 == 0 || j == 0) {
              chessBg.getComponent(cc.Sprite).spriteFrame = this.chessBgFrameList[1];
          }
          else if (j % 2 == 1 || j == 1) {
              chessBg.getComponent(cc.Sprite).spriteFrame = this.chessBgFrameList[0];
          }
      }
      chessBoard.addChild(chessBg);


      
        }
      }
    
      for(var i=0;i<this.col;i++)
      {
        for(var j=0;j<this.row;j++)
        {
        var v=new cc.Vec2(widthOffset*(i),heightOffset*(j));
        //add chess into chessBoard
        var chess=cc.instantiate(this.chess);
    
        chess.width=cc.winSize.width/this.col-this.chessOffset;
        chess.height= chess.width;

        chess.x=v.x+chess.width/2;
        chess.y=v.y+chess.height/2;
        chess.getComponent("ChessTs").initPos=new cc.Vec2(chess.x,chess.y);
        chessBoard.addChild(chess);

        }

      }

        //init step
        BattleGlobalTs.currentStep=BattleGlobalTs.myStep.PREPARE_STEP;

    }

 
  
}
