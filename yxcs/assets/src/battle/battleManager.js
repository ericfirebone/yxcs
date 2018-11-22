
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
//数组去重
Array.prototype.distinct = function () {
    var arr = this,
        i,
        obj = {},
        result = [],
        len = arr.length;
    for (i = 0; i < arr.length; i++) {
        if (!obj[arr[i]]) { //如果能查找到，证明数组元素重复了
            obj[arr[i]] = 1;
            result.push(arr[i]);
        }
    }
    return result;
};
var myStep = cc.Enum({
    PREPARE_STEP: 0,//prepare to move chess step
    MOVING_STEP: 1,//in moving chess step
    GETRESULT_STEP: 2,//move finish and rooling to find could destory chess 
    DESTROY_STEP: 3,//destory finish move down and create new chess to fill the blank
    EXEC_DESTROY_STEP:4,//execute destroy step
    MOVING_DOWN_STEP: 5,//fall down and fill board then back to step destroy
    JUDGE_FALLDOWN_POSMAP_STEP: 6,//local pos-name posmap before falldown
    EXEC_FALLDOWN_STEP: 7,//excute falldown 
    CREATE_NEW_CHESS_STEP: 8,//create new chess
    WAIT_FORFILL_STEP:9,//wait chess fill all the board
    JUDGE_DAMGE_HEAL_STEP:10,//the calculate damage and heal step
    MOVING_STEP: 11,//moving to next stage
    GAME_RESULT_STEP:12,//to get game result (game over or win)
    GAME_PAUSE_STEP:99//pause
});
cc.Class({
    extends: cc.Component,

    properties: {
        col: 6,
        row: 6,
        chess:
        {
            default: null,
            type: cc.Prefab
        },
        chessBg:
        {
            default: null,
            type: cc.Prefab
        },
        myOffset: 10,
        itemBgFrame://棋子格背景
        {
            default: [],
            type: [cc.SpriteFrame]
        },
        myExplode://消除的粒子效果预设
        {
            default: null,
            type: cc.Prefab
        },
        posMap: null,//记录位置K，名字V的当前对应MAP
        c: 0,//递归消除计数器
        destroyMinCountB: 3,//消除蓝色的最小连接数,默认三个一消
        destroyMinCountG: 3,//绿
        destroyMinCountR: 3,//红
        destroyMinCountL: 3,//光
        destroyMinCountD: 3,//暗
        destroyMinCountH: 3,//心
        destroyArray: null,//记录摧毁chess名字数组

        createPosArray: null,//记录POSINFOMAP中需要新生的点位Array
        steplock: true,//step控制器
        stepLastAction: null,//当前step最后一个动作
        actionArray: [],//当前步骤所做动作数组
        pubDelay: 0.2,//公共schedule等待时间
        redo: false,//是否为重新循环消除
        actArray: [],//记录消除时的所有动作

        hit:"",
        hitLabel:null,
        hit50: null,
        hit100: null,
        hit200: null,
        hit250:null
    },



    onLoad() {
        if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (keyCode, event) {
                    if (keyCode == cc.KEY.back) {
                        cc.director.end();
                    }
                },
                onKeyReleased: function (keyCode, event) {

                }
            }, this.node);
        }
        //初始化棋盘棋子
        let board = this.node.getChildByName("chessBoard");
        board.width = cc.winSize.width;
        board.height = cc.winSize.height * 2 / 3;
        board.y = -cc.winSize.height * 1 / 6;
        //初始化背景格子
        for (var i = 0; i < this.col; i++) {
            for (var j = 0; j < this.row; j++) {
                var itembg = cc.instantiate(this.chessBg);
                itembg.width = cc.winSize.width / 6;
                itembg.height = itembg.width;
                if (i % 2 == 0 || i == 0) {
                    if (j % 2 == 0 || j == 0) {
                        itembg.getComponent(cc.Sprite).spriteFrame = this.itemBgFrame[0];
                    }
                    else if (j % 2 == 1 || j == 1) {
                        itembg.getComponent(cc.Sprite).spriteFrame = this.itemBgFrame[1];
                    }
                }
                else if (i % 2 == 1 || i == 1) {
                    if (j % 2 == 0 || j == 0) {
                        itembg.getComponent(cc.Sprite).spriteFrame = this.itemBgFrame[1];
                    }
                    else if (j % 2 == 1 || j == 1) {
                        itembg.getComponent(cc.Sprite).spriteFrame = this.itemBgFrame[0];
                    }
                }
                itembg.x = cc.winSize.width / 6 * i - cc.winSize.width / 2 + itembg.width / 2;
                itembg.y = cc.winSize.width / 6 * j - board.height / 2 + itembg.height / 2;
                itembg.name = "bg_part";
                board.addChild(itembg);
            }
        }
        G.posInfoMap = new Map();
        for (var i = 0; i < this.col; i++) {
            for (var j = 0; j < this.row; j++) {

                var item = cc.instantiate(this.chess);
                item.width = cc.winSize.width / 6;
                item.height = item.width;
                item.x = cc.winSize.width / 6 * i - cc.winSize.width / 2 + item.width / 2;
                item.y = cc.winSize.width / 6 * j - board.height / 2 + item.height / 2;
                item.getComponent(cc.BoxCollider).Size = cc.Size(item.width * 2 / 3, item.width * 2 / 3);
                item.getComponent("chess").initPos = new cc.Vec2(item.x, item.y);
                // item.getComponent(cc.BoxCollider).Tag = i + "" + j;
                item.name = "chess" + i + "" + j;
                //item.coordinate = i + "" + j;
                // item.name = G.getUuid();
                item.getComponent(cc.BoxCollider).Tag = item.name;
                //  cc.log("item " + i + j + " tag:" + item.getComponent(cc.BoxCollider).Tag);
                board.addChild(item);
                G.posInfoMap.set(i + "" + j, item.getComponent("chess").initPos);
            }

        }


        //初始化阶段
        this.roolFindPosMap("wantAll");
        G.currentStep = myStep.PREPARE_STEP;

    },

    //-----------------------------------funcs-----------------------------

    //当移动结束后，对位置，每个位置上是哪个chess作为MAP返回
    roolFindCouldDestory: function () {

        let board = this.node.getChildByName("chessBoard");
        var posMap = new Map();

        var items = board.children;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            for (var x of G.posInfoMap) {
                if (x[1].x == item.getPosition().x && x[1].y == item.getPosition().y && item.name != "bg_part" && item.name != "particle_texture") {
                    posMap.set(x[0], item.name);
                }
            }
        }
        G.currentStep = myStep.DESTROY_STEP;
        return posMap;
    },
    //找到对应位置的对应棋子
    roolFindPosMap: function (wantGet) {
        let board = this.node.getChildByName("chessBoard");
        var posMap = new Map();
        var items = board.children;


        for (var x of G.posInfoMap) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (x[1].x == item.getPosition().x && x[1].y == item.getPosition().y && item.name != "bg_part" && item.name != "particle_texture") {
                    posMap.set(x[0], item.name);
                }

            }
            if (posMap.get(x[0]) == null) {
                posMap.set(x[0], null);
            }
        }
        this.posMap = posMap;
        if (wantGet != null && wantGet == "wantNull") {
            var posNullMap = new Map();
            for (var x of posMap) {
                if (x[1] == null) {
                    posNullMap.set(x[0], null);
                }
            }
            return posNullMap;
        }
        return posMap;
    },
    //做消除并下落的步骤
    doGetResultAndMovingDownStep: function () {

        this.roolFindPosMap();
        this.actArray = new Array();

        var isDestroy = this.destroyStepFunc();//确定需要消除的二维数组this.destroyArray,如果返回false则没有可消除的块进结算程序
        cc.log("isDestroy:" + isDestroy);
        if (isDestroy) {
            this.destroyItemStep();
            this.judgeDown();
            this.createNewChess();

        }
  

    },
    //如果有可消除的块则重新执行套路
    reDoGetResultAndMovingDownStep: function () {
        this.pubDelay = 0.2;

        this.actArray = new Array();
        this.destroyItemStep();
        this.judgeDown();
        this.createNewChess();

    }, 
    //找到消除项
    destroyStepFunc: function () {

        let board = this.node.getChildByName("chessBoard");
        var destroyMap = new Map();//需要消掉的位置名称键值对
        this.destroyArray = new Array();
        var largeNameArray = new Array();//已被消除数组计算在内的名称数组，如含有则不予重复消除
        //  var posMap = this.roolFindPosMap("wantAll");
        var posMap = this.posMap;
        cc.log("before destroyStepFunc");
        cc.log(this.posMap);
        for (var x of posMap) {
            var currentPos = x[0];
            var currentItemName = x[1];
            if (board.getChildByName(currentItemName) == null) {
                continue;
            }
            var currentType = board.getChildByName(currentItemName).getComponent("chess").chessType;

            var currentX = x[0].substr(0, 1);
            var currentY = x[0].substr(1, 1);
            var destroyMinCount = 3;
            switch (currentType) {//通过获得当前类型知道该类型是二消还是三消来决定最小消除数
                case ChessType.BLUE:
                    destroyMinCount = this.destroyMinCountB;
                    break;
                case ChessType.GREEN:
                    destroyMinCount = this.destroyMinCountG;
                    break;
                case ChessType.RED:
                    destroyMinCount = this.destroyMinCountR;
                    break;
                case ChessType.LIGHT:
                    destroyMinCount = this.destroyMinCountL;
                    break;
                case ChessType.HEART:
                    destroyMinCount = this.destroyMinCountH;
                    break;
                case ChessType.DARK:
                    destroyMinCount = this.destroyMinCountD;
                    break;

            }

            //先找到可消除的块，再把重叠相连的块算作一起，最后加入destroyArray
            var chessNameArray = this.recursiveAddNameToArray(board, currentItemName, currentX, currentY, posMap, destroyMinCount);

            if (chessNameArray != null && chessNameArray.length > 0) {
                var myhavesame = false;
                for (var i = 0; i < this.destroyArray.length; i++) {

                    if (this.destroyArray[i] != null && this.haveSame(this.destroyArray[i], chessNameArray, board)) {


                        this.destroyArray[i] = this.destroyArray[i].concat(chessNameArray);
                        myhavesame = true;

                    }
                }
                if (myhavesame == false) {
                    this.destroyArray.push(chessNameArray);
                }
            }
        }

        G.currentStep = myStep.EXEC_DESTROY_STEP;

        //如果没有可消除的块则结算，返回false
        if (this.destroyArray == null || this.destroyArray.length == 0) {

            return false;
        } else {

            return true;
        }
    },
    //递归找到有效可消除的块
    recursiveAddNameToArray: function (board, currentItemName, currentX, currentY, posMap, destroyMinCount) {

        var currentType = board.getChildByName(currentItemName).getComponent("chess").chessType;
        var chessNameArray = new Array();
        var beyondkeyup1 = currentX + "" + (parseInt(currentY) + 1);
        var beyondkeydown1 = currentX + "" + (parseInt(currentY) - 1);
        var beyondkeyleft1 = (parseInt(currentX) - 1) + "" + currentY;
        var beyondkeyright1 = (parseInt(currentX) + 1) + "" + currentY;
        var beyondkeyup2 = currentX + "" + (parseInt(currentY) + 2);
        var beyondkeydown2 = currentX + "" + (parseInt(currentY) - 2);
        var beyondkeyleft2 = (parseInt(currentX) - 2) + "" + currentY;
        var beyondkeyright2 = (parseInt(currentX) + 2) + "" + currentY;
        chessNameArray.push(currentItemName);
        if (destroyMinCount == 2) {

            if (posMap.get(beyondkeyup1) != null) {
                var beyondup1name = posMap.get(beyondkeyup1);
                if (board.getChildByName(beyondup1name) != null) {
                    var beyondup1type = board.getChildByName(beyondup1name).getComponent("chess").chessType;

                    if (beyondup1type == currentType) {

                        chessNameArray.push(beyondup1name);
                    }
                }
            }
            if (posMap.get(beyondkeydown1) != null) {
                var beyonddown1name = posMap.get(beyondkeydown1);
                if (board.getChildByName(beyonddown1name) != null) {
                    var beyonddown1type = board.getChildByName(beyonddown1name).getComponent("chess").chessType;

                    if (beyonddown1type == currentType) {

                        chessNameArray.push(beyonddown1name);
                    }
                }
            }
            if (posMap.get(beyondkeyleft1) != null) {
                var beyondleft1name = posMap.get(beyondkeyleft1);
                if (board.getChildByName(beyondleft1name) != null) {
                    var beyondleft1type = board.getChildByName(beyondleft1name).getComponent("chess").chessType;

                    if (beyondleft1type == currentType) {

                        chessNameArray.push(beyondleft1name);
                    }
                }
            }
            if (posMap.get(beyondkeyright1) != null) {
                var beyondright1name = posMap.get(beyondkeyright1);
                if (board.getChildByName(beyondright1name) != null) {
                    var beyondright1type = board.getChildByName(beyondright1name).getComponent("chess").chessType;

                    if (beyondright1type == currentType) {

                        chessNameArray.push(beyondright1name);
                    }
                }

            }

        }
        else if (destroyMinCount == 3) {
            if (posMap.get(beyondkeyup1) != null && posMap.get(beyondkeyup2) != null) {
                var beyondup1name = posMap.get(beyondkeyup1);
                var beyondup2name = posMap.get(beyondkeyup2);
                if (board.getChildByName(beyondup1name) != null && board.getChildByName(beyondup2name) != null) {
                    var beyondup1type = board.getChildByName(beyondup1name).getComponent("chess").chessType;
                    var beyondup2type = board.getChildByName(beyondup2name).getComponent("chess").chessType;
                    if (beyondup1type == currentType && beyondup2type == currentType) {

                        chessNameArray.push(beyondup1name);
                        chessNameArray.push(beyondup2name);
                    }
                }

            }
            if (posMap.get(beyondkeydown1) != null && posMap.get(beyondkeydown2) != null) {
                var beyonddown1name = posMap.get(beyondkeydown1);
                var beyonddown2name = posMap.get(beyondkeydown2);
                if (board.getChildByName(beyonddown1name) != null && board.getChildByName(beyonddown2name) != null) {
                    var beyonddown1type = board.getChildByName(beyonddown1name).getComponent("chess").chessType;
                    var beyonddown2type = board.getChildByName(beyonddown2name).getComponent("chess").chessType;
                    if (beyonddown1type == currentType && beyonddown2type == currentType) {

                        chessNameArray.push(beyonddown1name);
                        chessNameArray.push(beyonddown2name);
                    }
                }
            }
            if (posMap.get(beyondkeyleft1) != null && posMap.get(beyondkeyleft2) != null) {
                var beyondleft1name = posMap.get(beyondkeyleft1);
                var beyondleft2name = posMap.get(beyondkeyleft2);
                if (board.getChildByName(beyondleft1name) != null && board.getChildByName(beyondleft2name) != null) {
                    var beyondleft1type = board.getChildByName(beyondleft1name).getComponent("chess").chessType;
                    var beyondleft2type = board.getChildByName(beyondleft2name).getComponent("chess").chessType;
                    if (beyondleft1type == currentType && beyondleft2type == currentType) {

                        chessNameArray.push(beyondleft1name);
                        chessNameArray.push(beyondleft2name);
                    }
                }
            }
            if (posMap.get(beyondkeyright1) != null && posMap.get(beyondkeyright2) != null) {
                var beyondright1name = posMap.get(beyondkeyright1);
                var beyondright2name = posMap.get(beyondkeyright2);
                if (board.getChildByName(beyondright1name) != null && board.getChildByName(beyondright2name) != null) {
                    var beyondright1type = board.getChildByName(beyondright1name).getComponent("chess").chessType;
                    var beyondright2type = board.getChildByName(beyondright2name).getComponent("chess").chessType;
                    if (beyondright1type == currentType && beyondright2type == currentType) {

                        chessNameArray.push(beyondright1name);
                        chessNameArray.push(beyondright2name);
                    }
                }
            }
            if (posMap.get(beyondkeyright1) != null && posMap.get(beyondkeyleft1) != null) {
                var beyondright1name = posMap.get(beyondkeyright1);
                var beyondleft1name = posMap.get(beyondkeyleft1);
                if (board.getChildByName(beyondright1name) != null && board.getChildByName(beyondleft1name) != null) {
                    var beyondright1type = board.getChildByName(beyondright1name).getComponent("chess").chessType;
                    var beyondleft1type = board.getChildByName(beyondleft1name).getComponent("chess").chessType;

                    if (beyondright1type == currentType && beyondleft1type == currentType) {

                        chessNameArray.push(beyondright1name);
                        chessNameArray.push(beyondleft1name);
                    }
                }

            }
            if (posMap.get(beyondkeyup1) != null && posMap.get(beyondkeydown1) != null) {
                var beyondup1name = posMap.get(beyondkeyup1);
                var beyonddown1name = posMap.get(beyondkeydown1);
                if (board.getChildByName(beyondup1name) != null && board.getChildByName(beyonddown1name) != null) {
                    var beyondup1type = board.getChildByName(beyondup1name).getComponent("chess").chessType;
                    var beyonddown1type = board.getChildByName(beyonddown1name).getComponent("chess").chessType;
                    if (beyondup1type == currentType && beyonddown1type == currentType) {

                        chessNameArray.push(beyondup1name);
                        chessNameArray.push(beyonddown1name);

                    }
                }
            }
        }
        if (chessNameArray.length > 1) {
            return chessNameArray;
        }
    },
    //摧毁能消除的块
    destroyItemStep: function () {

        for (var i = 0; i < this.destroyArray.length; i++) {
            var nameArray = this.destroyArray[i];
            if (nameArray != null) {
                for (var j = 0; j < nameArray.length; j++) {
                    var name = nameArray[j];
                    cc.log("name:" + name + "i" + i + "j" + j);
                    for (var p of this.posMap) {
                        if (p[1] == name) {
                            this.posMap.set(p[0], null);
                        }
                    }

                    var destroyEffect = cc.callFunc(function (target, name) {
                      /*  for (var p of this.posMap) {
                            if (p[1] == name) {
                                this.posMap.set(p[0], null);
                            }
                        }*/
                        var board = cc.find("Canvas/chessBoard");
                        cc.log("name:" + name);
                        var item = board.getChildByName(name);
                        if (item != null) {
                            var particleNode = cc.instantiate(this.myExplode);
                            particleNode.setPosition(item.getPosition());
                            board.addChild(particleNode);
                            item.destroy();
                        }
                    }, this, name);

                    this.actArray.push(destroyEffect);

                }
                this.actArray.push(cc.delayTime(G.DESTROY_DELAY_TIME));
                this.pubDelay += G.DESTROY_DELAY_TIME;
            }
        }
    },
    //比较两个数组，如果有相同元素，则合并数组后返回
    haveSameConcatArray: function (array1, array2) {
        //临时数组存放
        var tempArray1 = [];//临时数组1
        var tempArray2 = [];//临时数组2

        for (var i = 0; i < array2.length; i++) {
            if (!tempArray1.hasOwnProperty(array1[i])) {
                tempArray1[array2[i]] = true;//将数array2 中的元素值作为tempArray1 中的键，值为true;
            }
        }

        for (var i = 0; i < array1.length; i++) {
            if (!tempArray1[array1[i]]) {
                tempArray2.push(array1[i]);//过滤array1 中与array2 相同的元素;
            }
        }

        var resultArray = new Array();
        if (tempArray2.length < array1.length) {
            resultArray = array1.concat(array2);
        }

        return resultArray;
    },
    //比较两个数组，如果有相同元素，返回真
    haveSameEle: function (array1, array2) {
        //临时数组存放
        var tempArray1 = [];//临时数组1
        var tempArray2 = [];//临时数组2

        for (var i = 0; i < array2.length; i++) {
            if (!tempArray1.hasOwnProperty(array1[i])) {
                tempArray1[array2[i]] = true;
            }
        }

        for (var i = 0; i < array1.length; i++) {
            if (tempArray1[array1[i]]) {
                return true;
            }
        }

        return false;
    },
    //比较两个数组，如果有相同元素，且元素chess类型一致，返回真
    haveSame: function (array1, array2, board) {
        //临时数组存放
        var tempArray1 = [];//临时数组1
        var tempArray2 = [];//临时数组2

        for (var i = 0; i < array2.length; i++) {
            if (!tempArray1.hasOwnProperty(array1[i])) {
                tempArray1[array2[i]] = true;
            }
        }

        for (var i = 0; i < array1.length; i++) {
            if (tempArray1[array1[i]]) {
                return true;
            }
        }

        return false;
    },
    //循环posMap判断是否含有本身为chess下格为空的情况，没有则进入CREATE_NEW_CHESS_STEP环节
    judgeDown: function () {

        let board = this.node.getChildByName("chessBoard");
        for (var x = 0; x < this.col; x++) {
            for (var y = 0; y < this.row - 1; y++) {
                if (this.posMap.get(x + "" + y) == null) {
                    var targetPos = G.posInfoMap.get(x + "" + y);
                    for (var i = y + 1; i < this.row; i++) {
                        if (this.posMap.get(x + "" + i) != null) {
                            var name = this.posMap.get(x + "" + i);
                            var item = board.getChildByName(name);

                            this.posMap.set(x + "" + i, null);
                            this.posMap.set(x + "" + y, name);
                            //   item.runAction(cc.moveTo(G.FALL_DOWN_DELAY, targetPos));
                            var nullPos = x + "" + i;
                            var fillPos = x + "" + y;
                            var parameter = { "item": item, "targetPos": targetPos, "nullPos": nullPos,"fillPos":fillPos};
                            this.actArray.push(cc.callFunc(function (target, parameter) {
                               // this.posMap.set(nullPos, null);
                               // this.posMap.set(fillPos, name);
                                cc.log("targetPos" + parameter.targetPos);
                                parameter.item.runAction(cc.moveTo(G.FALL_DOWN_DELAY, parameter.targetPos));

                            }, this, parameter));
                           
                            break;
                        }
                    }
                }


            }

        }
        this.actArray.push(cc.delayTime(G.FALL_DOWN_DELAY));
        this.pubDelay += G.FALL_DOWN_DELAY;
    },
    //创建新的chess
   createNewChess: function () {
        let board = this.node.getChildByName("chessBoard");
        for (var i = 0; i < this.col; i++) {
            for (var j = 0; j < this.row; j++) {
                if (this.posMap.get(i + "" + j) == null) {
                    var name = G.getUuid();
                     this.posMap.set(i + "" + j, name);
                    var key = i + "" + j;
                    var obj = { "name": name, "key": key };
                    var act = cc.callFunc(function (target, obj) {
           
                        var item = cc.instantiate(this.chess);
                        item.name = obj.name;
                        var targetPos = G.posInfoMap.get(obj.key);

                        item.x = targetPos.x;
                        item.y = cc.winSize.width;
                        item.getComponent(cc.BoxCollider).Size = cc.Size(item.width * 2 / 3, item.width * 2 / 3);
                        item.getComponent("chess").initPos = new cc.Vec2(item.x, item.y);
                        board.addChild(item);
                        item.runAction(cc.moveTo(G.FALL_DOWN_DELAY, targetPos));
                    }, this, obj);

                    this.actArray.push(act);

                }

            }
        }
        this.actArray.push(cc.delayTime(G.FALL_DOWN_DELAY));
        this.pubDelay += G.FALL_DOWN_DELAY;

        this.actArray.push(cc.delayTime(0.2));

        var isDestroy = this.destroyStepFunc();//确定需要消除的二维数组this.destroyArray,如果返回false则没有可消除的块进结算程序
        if (isDestroy) {
            this.actArray.push(cc.callFunc(function () {
                this.reDoGetResultAndMovingDownStep();
            },this));
        }

        var seq = cc.sequence(...this.actArray);
        this.node.runAction(seq);
   
    },
   //判断posMap是否含有空位
   isPosMapHaveBlank: function ()
   {
       for (var x of this.posMap)
       {
           if (x[1]==null)
           {
               return false;
           }
       }
       return true;
   },
   //找到chess的坐标
   findCoordinate: function (item)
   {

       for (var p of G.posInfoMap)
       {
           if (p[1].x == item.getPosition().x && p[1].y == item.getPosition().y)
           {
               return p[0];
           }
       }
       return null;
   }
});
