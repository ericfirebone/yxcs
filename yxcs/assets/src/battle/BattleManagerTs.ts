import { GlobalVariable } from '../util/GlobalTs';
import {BattleGlobalTs} from "./BattleGlobalTs";
import Chess from './ChessTs';
const {ccclass, property} = cc._decorator;

@ccclass
export default class BattleManager extends cc.Component {

    //chess count in one column
    @property(cc.Integer)
    public col=6;

    //chess count in one row
    @property(cc.Integer)
    public row=6;

    //chess brown background sprite prefab
    @property(cc.Prefab)
    private chessBg;

    //basic 6 kind and 6 kind of powerful chess type sprite list init by creator 
    @property([cc.SpriteFrame])
    private chessBgFrameList=[];

    //basic prefab of chess which could destroy
    @property(cc.Prefab)
    private chess;

    //chess adjoin each other space
    @property(cc.Float)
    public chessOffset=10;

    //how many chess adjoin could destory
    @property(cc.Integer)
    public destroyQualityCount=3;

    @property([Chess])
    public couldDestroyArray;

    public posMap:{[key:string]:string}={};
    public destroyNameMap:{[key:string]:Array<string>}={};
    public destroyArray=new Array<Array<string>>();
    public fallArray=new Array();
  
    @property(cc.Prefab)
    public  myExplode;

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
     
        
        //init chessBg into chessBoard
        var chessBg=cc.instantiate(this.chessBg);
    
        chessBg.width=cc.winSize.width/this.col;
        chessBg.height= chessBg.width;
        chessBg.x=v.x;
        chessBg.y=v.y;
        chessBg.name="bg_part";
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
        chess.name=BattleGlobalTs.getUuid();
        chess.x=v.x+chess.width/2;
        chess.y=v.y+chess.height/2;
      
        chess.getComponent("ChessTs").initPos=new cc.Vec2(chess.x,chess.y);
   
        BattleGlobalTs.posInfoMap[i+""+j]=new cc.Vec2(chess.x,chess.y);
        chessBoard.addChild(chess);

        }

      }
        // cc.log(BattleGlobalTs.posInfoMap);
        //init step
        BattleGlobalTs.currentStep=BattleGlobalTs.myStep.PREPARE_STEP;

    }

    /**
     * when move end destroy 3adjoining (or 2 is decide by destroyQualityCount) then fall down whiling the sequence
     * unit can not find chess could destroy
     * 
     */
    public   doGetResultAndMovingDownStep()
    {
     
      //  this.roolFindCoordinatePosMap();
     //   this.getDestroyNameMap();

        this.doProc();
    }
    

    /**
     * array remove same element
     * @param array 
     */
    public unique(array){
        var n = [];//temp array
        for(var i = 0;i < array.length; i++){
            if(n.indexOf(array[i]) == -1) n.push(array[i]);
        }
        return n;
    }
    
    public  doProc()
    {

        this.roolFindCoordinatePosMap();
      //  this.getDestroyNameMap();
        this.getDestroyArray();
        if(this.destroyArray.length>0)
        {
            this.destroyInDestroyArray();

        }
       // if(Object.keys(this.destroyNameMap).length!=0)
       // {

           //  this.destroyInDestroyMap();
                        
            // this.roolFindCoordinatePosMapAsync();
                 
            //  this.MoveDownAsync();
                 
            //  this.createNewFalldown();  

     //   }
    }
    public destroyInDestroyArray()
    {
        var self=this;
        var actionArray = new Array();
        let board=cc.find("Canvas/chessBoard");
        for(var i=0;i<this.destroyArray.length;i++)
        {
            for(var j=0;j<this.destroyArray[i].length;j++)
            {
                var chess=board.getChildByName(this.destroyArray[i][j]);
          
           if(chess!=null){
                
                var destroyCallFunc = cc.callFunc(  function (target, data) {
                    if(data!=null){
                    cc.log("destroy callFunc!!!");
                    var particleNode = cc.instantiate(self.myExplode);
                    particleNode.name="particle_texture";
                    particleNode.setPosition(data.getPosition());
                    board.addChild(particleNode);
                    data.destroy();
                    }
                },this,chess);
                
                actionArray.push(destroyCallFunc);
      
            }
             
                
            }
            
            actionArray.push(cc.delayTime(BattleGlobalTs.PUB_DELAY_TIME));
        }
        actionArray.push(cc.callFunc(()=>{

            self.roolFindCoordinatePosMap();
        }));
        actionArray.push(cc.callFunc(()=>{

            self.MoveDown();
        }));
        this.node.runAction(cc.sequence(actionArray));
    }
 
    public  destroyInDestroyMap()
    {
                     var self=this;
                    let board=cc.find("Canvas/chessBoard");
                    var counti=0;
                    for(var i in this.destroyNameMap)
                    {
                        counti++;
                    for(var j=0;j<this.destroyNameMap[i].length;j++)
                    {
                        var chess=board.getChildByName(this.destroyNameMap[i][j]);
                        if(chess!=null){

                          
                            var actionArray = new Array();
                            var destroyEffectCallFunc = cc.callFunc( ()=> {
                                var board = cc.find("Canvas/chessBoard");
                                var particleNode = cc.instantiate(chess.getComponent("ChessTs").myExplode);
                                particleNode.name="particle_texture";
                                particleNode.setPosition(chess.getPosition());
                                board.addChild(particleNode);
                    
                            }, this);
                            
                            var destroyCallFunc = cc.callFunc( ()=>{
                    
                                chess.destroy();
                            },this);
                            
                            actionArray.push(destroyEffectCallFunc);
                            actionArray.push(destroyCallFunc);
/*
                            var isLastIAndNextIsNull=true;
                            if(j!=this.destroyNameMap[i].length-1)
                           {
                            for(var k=j;k<this.destroyNameMap[i].length;k++)
                            {
                                if(board.getChildByName(this.destroyNameMap[i][k])!=null)
                                {

                                    isLastIAndNextIsNull=false;
                                }

                            }
                             }
                            if(counti==Object.keys(this.destroyNameMap).length-1&&isLastIAndNextIsNull)
                            {
                               
                                var doFallDownCallFunc = cc.callFunc( ()=>{
                                    self.roolFindCoordinatePosMap();
                                 //   self.MoveDown();
                                    
                                },this);
                                actionArray.push(doFallDownCallFunc);
                            }*/
                            chess.runAction(cc.sequence(actionArray));

                    }
          
                    }
                }
                    cc.log("destroy finish");
              

    }

   
    public getDestroyArray()
    {
        var destroyArray=new Array<Array<string>>();
        var posMap=this.posMap;
        for(var k in posMap)
         {
          //   cc.log(k+" "+posMap[k]);
            let board=this.node.getChildByName("chessBoard");
            var currentChess=board.getChildByName(posMap[k]);
            var currentType=currentChess.getComponent("ChessTs").chessType;
            var currentI=parseInt(k.substr(0,1));
            var currentJ=parseInt(k.substr(1,1));
            
            var nextI1=currentI+1;
            var nextI2=currentI+2;
            var nextJ1=currentJ+1;
            var nextJ2=currentJ+2;

         

            var nextXk1="99";
            var nextXChess1=null;
            if(nextI1<this.col)
            {
                 nextXk1=nextI1+""+currentJ;
                 nextXChess1=board.getChildByName(posMap[nextXk1]);
            }

            var nextXk2="99";
            var nextXChess2=null;
            if(nextI2<this.col)
            {
                nextXk2=nextI2+""+currentJ;
                nextXChess2=board.getChildByName(posMap[nextXk2]);
            }
          
            var nextYk1="99";
            var nextYChess1=null;
            if(nextJ1<this.row)
            {
                 nextYk1=currentI+""+nextJ1;
                 nextYChess1=board.getChildByName(posMap[nextYk1]);
            }

            var nextYk2="99";
            var nextYChess2=null;
            if(nextJ2<this.row)
            {
                nextYk2=currentI+""+nextJ2;
                nextYChess2=board.getChildByName(posMap[nextYk2]);
            }

     
            if(nextXChess1!=null&&nextXChess2!=null)
            {
                var nextXChess1Type=nextXChess1.getComponent("ChessTs").chessType;
                var nextXChess2Type=nextXChess2.getComponent("ChessTs").chessType;
        
                if(nextXChess1Type==currentType&&nextXChess2Type==currentType)
                {
                   
                    var index=-1;
                    for(var i=0; i< destroyArray.length;i++)
                    {
                        if(destroyArray[i].indexOf(currentChess.name)!=-1||destroyArray[i].indexOf(nextXChess1.name)!=-1||destroyArray[i].indexOf(nextXChess2.name)!=-1)
                        {
                        index=i;
                        }
                    }
                    if(index!=-1)
                    {
                        destroyArray[index].push(currentChess.name);
                        destroyArray[index].push(nextXChess1.name);
                        destroyArray[index].push(nextXChess2.name);
                    }else
                    {
                    
                        destroyArray.push(new Array(currentChess.name,nextXChess1.name,nextXChess2.name));
                    }
                }
            }

            if(nextYChess1!=null&&nextYChess2!=null)
            {
                var nextYChess1Type=nextYChess1.getComponent("ChessTs").chessType;
                var nextYChess2Type=nextYChess2.getComponent("ChessTs").chessType;
                if(nextYChess1Type==currentType&&nextYChess2Type==currentType)
                {
                    var index=-1;
                    for(var i=0; i< destroyArray.length;i++)
                    {
                        if(destroyArray[i].indexOf(currentChess.name)!=-1||destroyArray[i].indexOf(nextYChess1.name)!=-1||destroyArray[i].indexOf(nextYChess2.name)!=-1)
                        {
                        index=i;
                        }
                    }
                    if(index!=-1)
                    {
                        destroyArray[index].push(currentChess.name);
                        destroyArray[index].push(nextYChess1.name);
                        destroyArray[index].push(nextYChess2.name);
                    }else
                    {
                     
                        destroyArray.push(new Array(currentChess.name,nextYChess1.name,nextYChess2.name));
                    }

                }
            }
         }
         this.destroyArray=destroyArray;
    }

    public getDestroyNameMap()
    {
        var destroyNameMap:{[key:string]:Array<string>}={};

         let posMap=this.posMap;

         for(var k in posMap)
         {
          //   cc.log(k+" "+posMap[k]);
            let board=this.node.getChildByName("chessBoard");
            var currentChess=board.getChildByName(posMap[k]);
            var currentType=currentChess.getComponent("ChessTs").chessType;
            var currentI=parseInt(k.substr(0,1));
            var currentJ=parseInt(k.substr(1,1));
            
            var nextI1=currentI+1;
            var nextI2=currentI+2;
            var nextJ1=currentJ+1;
            var nextJ2=currentJ+2;

         

            var nextXk1="99";
            var nextXChess1=null;
            if(nextI1<this.col)
            {
                 nextXk1=nextI1+""+currentJ;
                 nextXChess1=board.getChildByName(posMap[nextXk1]);
            }

            var nextXk2="99";
            var nextXChess2=null;
            if(nextI2<this.col)
            {
                nextXk2=nextI2+""+currentJ;
                nextXChess2=board.getChildByName(posMap[nextXk2]);
            }
          
            var nextYk1="99";
            var nextYChess1=null;
            if(nextJ1<this.row)
            {
                 nextYk1=currentI+""+nextJ1;
                 nextYChess1=board.getChildByName(posMap[nextYk1]);
            }

            var nextYk2="99";
            var nextYChess2=null;
            if(nextJ2<this.row)
            {
                nextYk2=currentI+""+nextJ2;
                nextYChess2=board.getChildByName(posMap[nextYk2]);
            }

     
            if(nextXChess1!=null&&nextXChess2!=null)
            {
                var nextXChess1Type=nextXChess1.getComponent("ChessTs").chessType;
                var nextXChess2Type=nextXChess2.getComponent("ChessTs").chessType;
        
                if(nextXChess1Type==currentType&&nextXChess2Type==currentType)
                {
                   
                    var index="";
                    for(var i in destroyNameMap)
                    {
                        if(destroyNameMap[i].indexOf(currentChess.name)!=-1||destroyNameMap[i].indexOf(nextXChess1.name)!=-1||destroyNameMap[i].indexOf(nextXChess2.name)!=-1)
                        {
                        index=i;
                        }
                    }
                    if(index!="")
                    {
                        destroyNameMap[index].push(currentChess.name);
                        destroyNameMap[index].push(nextXChess1.name);
                        destroyNameMap[index].push(nextXChess2.name);
                    }else
                    {
                        var uuid=BattleGlobalTs.getUuid();
                        destroyNameMap[uuid]=new Array(currentChess.name,nextXChess1.name,nextXChess2.name);
                    }
                }
            }

            if(nextYChess1!=null&&nextYChess2!=null)
            {
                var nextYChess1Type=nextYChess1.getComponent("ChessTs").chessType;
                var nextYChess2Type=nextYChess2.getComponent("ChessTs").chessType;
                if(nextYChess1Type==currentType&&nextYChess2Type==currentType)
                {
                    var index="";
                    for(var i in destroyNameMap)
                    {
                        if(destroyNameMap[i].indexOf(currentChess.name)!=-1||destroyNameMap[i].indexOf(nextYChess1.name)!=-1||destroyNameMap[i].indexOf(nextYChess2.name)!=-1)
                        {
                        index=i;
                        }
                    }
                    if(index!="")
                    {
                        destroyNameMap[index].push(currentChess.name);
                        destroyNameMap[index].push(nextYChess1.name);
                        destroyNameMap[index].push(nextYChess2.name);
                    }else
                    {
                        var uuid=BattleGlobalTs.getUuid();
                        destroyNameMap[uuid]=new Array(currentChess.name,nextYChess1.name,nextYChess2.name);
                    }

                }
            }
         }
     
    
         cc.log("before destroyNameMap Show");
      this.destroyNameMap=destroyNameMap;
      for(var i in this.destroyNameMap){
      cc.log(this.destroyNameMap[i]);
       }
       cc.log("========================");
        return destroyNameMap;
    }


    public getDestroyNameMapAsync()
    {
        return new Promise((resolve,reject)=>{   
            resolve(setTimeout(()=>{

                var destroyNameMap:{[key:string]:Array<string>}={};
               
                    let posMap=this.posMap;
                    cc.log("beforeDestroyPosCreate");
                    cc.log(posMap);
                    for(var k in posMap)
                    {
                     //   cc.log(k+" "+posMap[k]);
                       let board=this.node.getChildByName("chessBoard");
                       var currentChess=board.getChildByName(posMap[k]);
                       var currentType=currentChess.getComponent("ChessTs").chessType;
                       var currentI=parseInt(k.substr(0,1));
                       var currentJ=parseInt(k.substr(1,1));
                       
                       var nextI1=currentI+1;
                       var nextI2=currentI+2;
                       var nextJ1=currentJ+1;
                       var nextJ2=currentJ+2;
           
                    
           
                       var nextXk1="99";
                       var nextXChess1=null;
                       if(nextI1<this.col)
                       {
                            nextXk1=nextI1+""+currentJ;
                            nextXChess1=board.getChildByName(posMap[nextXk1]);
                       }
           
                       var nextXk2="99";
                       var nextXChess2=null;
                       if(nextI2<this.col)
                       {
                           nextXk2=nextI2+""+currentJ;
                           nextXChess2=board.getChildByName(posMap[nextXk2]);
                       }
                     
                       var nextYk1="99";
                       var nextYChess1=null;
                       if(nextJ1<this.row)
                       {
                            nextYk1=currentI+""+nextJ1;
                            nextYChess1=board.getChildByName(posMap[nextYk1]);
                       }
           
                       var nextYk2="99";
                       var nextYChess2=null;
                       if(nextJ2<this.row)
                       {
                           nextYk2=currentI+""+nextJ2;
                           nextYChess2=board.getChildByName(posMap[nextYk2]);
                       }
           
                
                       if(nextXChess1!=null&&nextXChess2!=null)
                       {
                           var nextXChess1Type=nextXChess1.getComponent("ChessTs").chessType;
                           var nextXChess2Type=nextXChess2.getComponent("ChessTs").chessType;
                   
                           if(nextXChess1Type==currentType&&nextXChess2Type==currentType)
                           {
                          
                               var index="";
                               for(var i in destroyNameMap)
                               {
                                   if(destroyNameMap[i].indexOf(currentChess.name)!=-1||destroyNameMap[i].indexOf(nextXChess1.name)!=-1||destroyNameMap[i].indexOf(nextXChess2.name)!=-1)
                                   {
                                   index=i;
                                   }
                               }
                               if(index!="")
                               {
                                   destroyNameMap[index].push(currentChess.name);
                                   destroyNameMap[index].push(nextXChess1.name);
                                   destroyNameMap[index].push(nextXChess2.name);
                               }else
                               {
                                   var uuid=BattleGlobalTs.getUuid();
                                   destroyNameMap[uuid]=new Array(currentChess.name,nextXChess1.name,nextXChess2.name);
                               }
                           }
                       }
           
                       if(nextYChess1!=null&&nextYChess2!=null)
                       {
                           var nextYChess1Type=nextYChess1.getComponent("ChessTs").chessType;
                           var nextYChess2Type=nextYChess2.getComponent("ChessTs").chessType;
                           if(nextYChess1Type==currentType&&nextYChess2Type==currentType)
                           {
                      
                               var index="";
                               for(var i in destroyNameMap)
                               {
                                   if(destroyNameMap[i].indexOf(currentChess.name)!=-1||destroyNameMap[i].indexOf(nextYChess1.name)!=-1||destroyNameMap[i].indexOf(nextYChess2.name)!=-1)
                                   {
                                   index=i;
                                   }
                               }
                               if(index!="")
                               {
                                   destroyNameMap[index].push(currentChess.name);
                                   destroyNameMap[index].push(nextYChess1.name);
                                   destroyNameMap[index].push(nextYChess2.name);
                               }else
                               {
                                   var uuid=BattleGlobalTs.getUuid();
                                   destroyNameMap[uuid]=new Array(currentChess.name,nextYChess1.name,nextYChess2.name);
                               }
           
                           }
                       }
                    }
               
                  
                 this.destroyNameMap=destroyNameMap;
                 cc.log("before destroyNameMap Show");
                    for(var k in this.destroyNameMap)
                    {
                        cc.log(this.destroyNameMap[k]);

                    }
                cc.log("========================");
            },BattleGlobalTs.PUB_DELAY_TIME*1000));
        });

    }
    /**
     * find coordinate-chessName kv map
     */
    roolFindCoordinatePosMap () {

        let board = this.node.getChildByName("chessBoard");
        this.posMap={};

        var items = board.children;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            for (let x in BattleGlobalTs.posInfoMap) {
             
                if (BattleGlobalTs.posInfoMap[x].x == item.getPosition().x && BattleGlobalTs.posInfoMap[x].y == item.getPosition().y && item.name != "bg_part" && item.name != "particle_texture"&&item.name!=null&&typeof(item.name) != "undefined") {
                    this.posMap[x]=item.name;
                }
            }
        }
        cc.log("this.posMap");
        cc.log(this.posMap);
        BattleGlobalTs.currentStep = BattleGlobalTs.myStep.DESTROY_STEP;
        
        return this.posMap;
    }

    
    /**
     * find coordinate-chessName kv map async version
     * 
     * can not know why must in resolve setTimeout if not it will not async
     */
    public roolFindCoordinatePosMapAsync()
    {
        
        return new Promise((resolve,reject)=>{   
            resolve( setTimeout(()=>{ 
                let board = this.node.getChildByName("chessBoard");
                this.posMap={};
                var items = board.children;
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    for (let x in BattleGlobalTs.posInfoMap) {
                    
                        if (BattleGlobalTs.posInfoMap[x].x == item.getPosition().x && BattleGlobalTs.posInfoMap[x].y == item.getPosition().y && item.name != "bg_part" && item.name != "particle_texture"&&item.name!=null&&typeof(item.name) != "undefined") {
                            this.posMap[x]=item.name;
                        }

                 
                    }
                }
                cc.log("create posMap");
                cc.log(this.posMap);
            },BattleGlobalTs.PUB_DELAY_TIME*1000));
        
        });


    }
  
    /**
     * find could move down chess and move down and chanage the posMap
     */
    public MoveDown()
    {
                var self=this;
                var fallMap:{[key:string]:cc.Action}={};
                cc.log("Object.keys(fallMap).length:"+Object.keys(fallMap).length);
                let board = this.node.getChildByName("chessBoard");
                for(var i=0;i<this.col;i++)
                {
                    for(var j=0;j<this.row;j++)
                    {
                        if(this.posMap[i+""+j]==null)
                        {
                            if(this.col-1>j){
                                //    var distance=this.col-1-j;
                                    for(var k=j;k<this.col;k++)
                                    {
                                        if(this.posMap[i+""+k]!=null)
                                        {
                                            var distPos=BattleGlobalTs.posInfoMap[i+""+j];
                                            var actionFallDown=cc.moveTo(BattleGlobalTs.FALLDOWN_DELAY_TIME,distPos);
                                            var chess=board.getChildByName(this.posMap[i+""+k]);
                                          //  chess.runAction(actionFallDown);
                                            this.posMap[i+""+j]=this.posMap[i+""+k];
                                            this.posMap[i+""+k]=null;
                                            fallMap[chess.name]=actionFallDown;
                                            break;
                                        }

                                    }

                            }

                        }


                    }

                }
                cc.log("Object.keys(fallMap).length:"+Object.keys(fallMap).length);
                var fallMapCount=1;
                var fallMapMax= Object.keys(fallMap).length;
                if(fallMapMax==0){
                    var createNewFalldownFunc=cc.callFunc(function(){

                        self.createNewFalldown();
                        
                    });
                    self.node.runAction(createNewFalldownFunc);
                }else{
                Object.keys(fallMap).forEach(k => {
                    fallMapCount++;
                  //  if (fallMap.hasOwnProperty(k)) {

                        var chess=board.getChildByName(k);
                       
                    if(fallMapCount>=fallMapMax)
                    {
                        var createNewFalldownFunc=cc.callFunc(function(){

                            self.createNewFalldown();
                            
                        });
                       var actionArray=new Array();
                       actionArray.push(fallMap[k]);
                       actionArray.push(cc.delayTime(BattleGlobalTs.WAIT_DELAY_TIME));
                    //   actionArray.push(cc.callFunc(()=>{

                    //    self.roolFindCoordinatePosMap();
                  //  }));
                       actionArray.push(createNewFalldownFunc);
                        chess.runAction(cc.sequence(actionArray));
                    }else
                    {
                        chess.runAction(fallMap[k]);

                    }
                  //  }
                });
            }
                cc.log("finish falldown");
                cc.log(this.posMap);
         


    }
    

    public createNewFalldown()
    {

      //  return new Promise((resolve,reject)=>{   
       //     resolve(setTimeout(()=>{
                var self=this;
           
                cc.log("create new");
                cc.log(this.posMap);
                let board = this.node.getChildByName("chessBoard");
                var tempMap:{[key:string]:cc.Action}={};
                for(var i=0;i<this.col;i++)
                {
                    for(var j=0;j<this.row;j++)
                    {
                        if(this.posMap[i+""+j]==null)
                        {
                            var chess=cc.instantiate(this.chess);
                          
                            chess.name=BattleGlobalTs.getUuid();
                            chess.y=cc.winSize.width+chess.height/2;
                            chess.x=BattleGlobalTs.posInfoMap[i+"0"].x;
                            board.addChild(chess);
                            var actionFalldown=cc.moveTo(BattleGlobalTs.PUB_DELAY_TIME,BattleGlobalTs.posInfoMap[i+""+j]);
                         
                           this.posMap[i+""+j]=chess.name;
                           tempMap[chess.name]=actionFalldown;
                        }

                    }

                }
                var tempMapCount=1;
                var tempMapMax=Object.keys(tempMap).length;
                cc.log("Object.keys(tempMap).length:"+Object.keys(tempMap).length);
                if(tempMapMax==0){
                    BattleGlobalTs.currentStep=BattleGlobalTs.myStep.JUDGE_DAMGE_HEAL_STEP;
                }else{
                Object.keys(tempMap).forEach(k => {
                    tempMapCount++;
                   
                   if(tempMapCount>=tempMapMax)
                    {
                        var toDoProc=cc.callFunc(function(){
                           
                            self.doProc();
                        });
                       
                        var chess=board.getChildByName(k);
                        var tempArray=new Array();
                        tempArray.push(tempMap[k]);
                        tempArray.push(cc.delayTime(BattleGlobalTs.WAIT_DELAY_TIME));
                      //  tempArray.push(cc.callFunc(()=>{

                      //     self.getDestroyArray();
                    //   }));
                        tempArray.push(toDoProc);
                        chess.runAction(cc.sequence(...tempArray));

                    }else
                    {
                        var chess=board.getChildByName(k);
                        chess.runAction(tempMap[k]);
                    }

                });
            }
       //     },BattleGlobalTs.PUB_DELAY_TIME*1000));
     //   });

    }

  
}
