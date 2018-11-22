var Common = require('JoystickBar');

cc.Class({
    extends: cc.Component,

    properties: {
        dot: {
            default: null,
            type: cc.Node,
            displayName: '摇杆节点',
        },

        _joyCom: {
            default: null,
            displayName: 'joy Node',

        },
        _playerNode: {
            default: null,
            displayName: '被操作的目标Node',
        },
        _opreatBg:
        {
            default: null,
            displayName: '操纵的背景地图',
        },
        _angle: {
            default: null,
            displayName: '当前触摸的角度',

        },

        _radian: {
            default: null,
            displayName: '弧度',
        },


        _speed: 0, //实际速度  
        speed1: 10, //一段速度  
        speed2: 20, //二段速度  
        _opacity: 0, //透明度  
        _initHeroXAbs: 0,//初始英雄位置X绝对值
        _initHeroYAbs: 0,//初始英雄位置Y绝对值
        _initGroundXAbs: 0,//初始背景位置X绝对值
        _initGroundYAbs: 0,//初始背景位置Y绝对值
        lbool: true,
        rbool: true,
        ubool: true,
        dbool: true,
    },


    onLoad: function () {
        // joy下的Joystick组件  
        this._joyCom = this.node.parent.getComponent('Joystick');
        // Joystick组件下的player节点  
        this._playerNode = this._joyCom.sprite;
        this._opreatBg = this._joyCom.opreatBg;
        this._initHeroXAbs = Math.abs(this._playerNode.x);
        this._initHeroYAbs = Math.abs(this._playerNode.y);
        this._initGroundXAbs = Math.abs(this._opreatBg.x);
        this._initGroundYAbs = Math.abs(this._opreatBg.y);
        if (this._joyCom.touchType == Common.TouchType.DEFAULT) {
            //对圆圈的触摸监听  
            this._initTouchEvent();
        }




    },


    //对圆圈的触摸监听  
    _initTouchEvent: function () {
        var self = this;

        self.node.on(cc.Node.EventType.TOUCH_START, this._touchStartEvent, self);

        self.node.on(cc.Node.EventType.TOUCH_MOVE, this._touchMoveEvent, self);

        // 触摸在圆圈内离开或在圆圈外离开后，摇杆归位，player速度为0  
        self.node.on(cc.Node.EventType.TOUCH_END, this._touchEndEvent, self);
        self.node.on(cc.Node.EventType.TOUCH_CANCEL, this._touchEndEvent, self);
    },

    //更新移动目标  
    update: function (dt) {
        switch (this._joyCom.directionType) {
            case Common.DirectionType.FOUR:
                var dir = this._fourDirectionsMove();
                if (this._playerNode.getComponent('hero').dir != dir) {
                    this._playerNode.getComponent('hero').changeDirection(dir);
                    this._playerNode.getComponent('hero').dir = dir
                }
                break;
            case Common.DirectionType.EIGHT:
                this._eightDirectionsMove();
                break;
            case Common.DirectionType.ALL:
                this._allDirectionsMove();
                break;
            default:
                break;
        }
    },

    //将像素坐标转化为瓦片坐标，posInPixel：目标节点的position，地图锚点方式00:以0点为准,05以0.5为准
    _getTilePos: function (posInPixel, mapComponent, anthorType) {
        if (anthorType == "00") {
            var mapSize = mapComponent.node.getContentSize();
            var tileSize = mapComponent.getTileSize();
            var x = Math.floor(posInPixel.x / tileSize.width);
            var y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);
        } else if (anthorType == "05")
        {
            var mapSize = mapComponent.node.getContentSize();
            var tileSize = mapComponent.getTileSize();

            var x = Math.floor((posInPixel.x + mapSize.width / 2) / tileSize.width);
            var y = Math.floor((mapSize.height - (posInPixel.y + mapSize.height/2)) / tileSize.height);

        }
        return cc.p(x, y);
    },

    //四个方向移动(上下左右)    
    _fourDirectionsMove: function () {
        var layer = this._opreatBg.getComponent(cc.TiledMap).getLayer('block');
        //cc.log("gid:" + layer.getTileGIDAt(0, 0));

if (this._angle > 45 && this._angle < 135) {
    if (this._opreatBg != null) {

        var tilePos = this._getTilePos(cc.p(this._playerNode.x, this._playerNode.y + this._speed), this._opreatBg.getComponent(cc.TiledMap),"05");
        // cc.log("x:" + tilePos.x + " y:" + tilePos.y);
        //  cc.log("cc.view.getViewPortRect().height:"+cc.view.getViewPortRect().height);
        //  cc.log("this._opreatBg.height:"+this._opreatBg.height);
        //  cc.log("this._opreatBg.y :" + this._opreatBg.y);
        //   cc.log("this._playerNode.y " + this._playerNode.y);

        if (layer.getTileGIDAt(tilePos))//遇到障碍
        {
           // cc.log(layer.getTileGIDAt(tilePos));
        } else {
            //主角坐标+主角精灵高度+速度<背景高度
            if (this.ubool && this._playerNode.y + this._playerNode.height / 2 + this._speed / 2 < this._opreatBg.height / 2) {
                this._playerNode.y += this._speed / 2;
            }
            
        }
    } else {

        this._playerNode.y += this._speed;
    }

    return "u";

} else if (this._angle > -135 && this._angle < -45) {
    if (this._opreatBg != null) {
        var tilePos = this._getTilePos(cc.p(this._playerNode.x, this._playerNode.y - this._speed), this._opreatBg.getComponent(cc.TiledMap), "05");
        //  cc.log("x:" + tilePos.x + " y:" + tilePos.y);
        if (layer.getTileGIDAt(tilePos))//遇到障碍
        {
           // cc.log(layer.getTileGIDAt(tilePos));
        } else {
            if (this.dbool && this._playerNode.y - this._speed / 2 - this._playerNode.height / 2 > -this._opreatBg.height / 2) {
                this._playerNode.y -= this._speed / 2;
            }
           
        }
    } else {

        this._playerNode.y -= this._speed;
    }

    return "d";

} else if (this._angle < -135 && this._angle > -180 || this._angle > 135 && this._angle <180) {
    if (this._opreatBg != null) {
        var tilePos = this._getTilePos(cc.p(this._playerNode.x - this._speed, this._playerNode.y), this._opreatBg.getComponent(cc.TiledMap), "05");
      //    cc.log("x:" + tilePos.x + " y:" + tilePos.y);
        if (layer.getTileGIDAt(tilePos))//遇到障碍
        {

        } else {
            if (this.lbool && this._playerNode.x - this._speed / 2 - this._playerNode.width / 2 > -this._opreatBg.width / 2) {
                this._playerNode.x -= this._speed / 2;
            }
           
        }
    } else {

        this._playerNode.x -= this._speed;
    }
    return "l";

} else if (this._angle < 0 && this._angle > -45 || this._angle > 0 && this._angle < 45) {
    if (this._opreatBg != null) {
        var tilePos = this._getTilePos(cc.p(this._playerNode.x + this._speed, this._playerNode.y), this._opreatBg.getComponent(cc.TiledMap), "05");
     //      cc.log("x:" + tilePos.x + " y:" + tilePos.y);
        if (layer.getTileGIDAt(tilePos))//遇到障碍
        {

        } else {
            if (this.rbool && this._playerNode.x + this._speed / 2 + this._playerNode.width / 2 < this._opreatBg.width / 2) {

                this._playerNode.x += this._speed / 2;
            }
            
        }
    } else {

        this._playerNode.x += this._speed;
    }
    return "r";

}
          
    },

//八个方向移动(上下左右、左上、右上、左下、右下)    
_eightDirectionsMove: function () {
    if (this._angle > 67.5 && this._angle < 112.5) {
        this._playerNode.y += this._speed;
    } else if (this._angle > -112.5 && this._angle < -67.5) {
        this._playerNode.y -= this._speed;
    } else if (this._angle < -157.5 && this._angle > -180 || this._angle > 157.5 && this._angle

        < 180) {
        this._playerNode.x -= this._speed;
    } else if (this._angle < 0 && this._angle > -22.5 || this._angle > 0 && this._angle < 22.5) {
        this._playerNode.x += this._speed;
    } else if (this._angle > 112.5 && this._angle < 157.5) {
        this._playerNode.x -= this._speed / 1.414;
        this._playerNode.y += this._speed / 1.414;
    } else if (this._angle > 22.5 && this._angle < 67.5) {
        this._playerNode.x += this._speed / 1.414;
        this._playerNode.y += this._speed / 1.414;
    } else if (this._angle > -157.5 && this._angle < -112.5) {
        this._playerNode.x -= this._speed / 1.414;
        this._playerNode.y -= this._speed / 1.414;
    } else if (this._angle > -67.5 && this._angle < -22.5) {
        this._playerNode.x += this._speed / 1.414;
        this._playerNode.y -= this._speed / 1.414;
    }
},

//全方向移动  
_allDirectionsMove: function () {
    this._playerNode.x += Math.cos(this._angle * (Math.PI / 180)) * this._speed;
    this._playerNode.y += Math.sin(this._angle * (Math.PI / 180)) * this._speed;
},

//计算两点间的距离并返回  
_getDistance: function (pos1, pos2) {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) +
        Math.pow(pos1.y - pos2.y, 2));
},

/*角度/弧度转换 
角度 = 弧度 * 180 / Math.PI 
弧度 = 角度 * Math.PI / 180*/
//计算弧度并返回  
_getRadian: function (point) {
    this._radian = Math.PI / 180 * this._getAngle(point);
    return this._radian;
},

//计算角度并返回  
_getAngle: function (point) {

    var pos = this.node.getPosition();
    this._angle = Math.atan2(point.y - pos.y, point.x - pos.x) * (180 / Math.PI);
    return this._angle;
},

//设置实际速度  
_setSpeed: function (point) {
    //触摸点和遥控杆中心的距离  
    var distance = this._getDistance(point, this.node.getPosition());

    //如果半径  
    if (distance < this._radius) {
        this._speed = this.speed1;

    } else {
        this._speed = this.speed2;

    }

},

_touchStartEvent: function (event) {
    // 获取触摸位置的世界坐标转换成圆圈的相对坐标（以圆圈的锚点为基准）  
    var touchPos = this.node.convertToNodeSpaceAR(event.getLocation());
    //触摸点与圆圈中心的距离  
    var distance = this._getDistance(touchPos, cc.p(0, 0));
    //圆圈半径  
    var radius = this.node.width / 2;
    // 记录摇杆位置，给touch move使用  
    this._stickPos = touchPos;
    var posX = this.node.getPosition().x + touchPos.x;
    var posY = this.node.getPosition().y + touchPos.y;
    //手指在圆圈内触摸,控杆跟随触摸点  
    if (radius > distance) {
        this.dot.setPosition(cc.p(posX, posY));
        return true;
    }
    return false;
},

_touchMoveEvent: function (event) {
    var touchPos = this.node.convertToNodeSpaceAR(event.getLocation());
    var distance = this._getDistance(touchPos, cc.p(0, 0));
    var radius = this.node.width / 2;
    // 由于摇杆的postion是以父节点为锚点，所以定位要加上ring和dot当前的位置(stickX,stickY)  
    var posX = this.node.getPosition().x + touchPos.x;
    var posY = this.node.getPosition().y + touchPos.y;
    if (radius > distance) {
        this.dot.setPosition(cc.p(posX, posY));
    } else {
        //控杆永远保持在圈内，并在圈内跟随触摸更新角度  
        var x = this.node.getPosition().x + Math.cos(this._getRadian(cc.p(posX, posY))) *

            radius;
        var y = this.node.getPosition().y + Math.sin(this._getRadian(cc.p(posX, posY))) *

            radius;
        this.dot.setPosition(cc.p(x, y));
    }
    //更新角度  
    this._getAngle(cc.p(posX, posY));
    //设置实际速度  
    this._setSpeed(cc.p(posX, posY));


},

_touchEndEvent: function () {
    this.dot.setPosition(this.node.getPosition());
    switch (this._playerNode.getComponent("hero").dir) {
        case "u":
            this._playerNode.getComponent("hero").changeDirection("su");
            break;
        case "d":
            this._playerNode.getComponent("hero").changeDirection("sd");
            break;
        case "r":
            this._playerNode.getComponent("hero").changeDirection("sr");
            break;
        case "l":
            this._playerNode.getComponent("hero").changeDirection("sl");
            break;
    }
    this._speed = 0;
},
   
});  