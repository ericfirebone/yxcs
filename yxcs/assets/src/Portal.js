

cc.Class({
    extends: cc.Component,

    properties: {
  
        
        portalName: "",
        transToSceneName:"",
        playerNode: {
            default: null,
            type: cc.Node,
            displayName: '检测碰撞的节点',
        },
    },



    onLoad() {
        // joy下的Joystick组件  
       // this._joyCom = this.node.parent.getComponent('Joystick');
      //  this.backNode = cc.find("Canvas/Joy/sprite");
        // Joystick组件下的player节点  
       // this._playerNode = cc.find("Canvas/Joy/sprite");


    },

  

    update(dt) {
        if (cc.Intersection.rectRect(this.playerNode.getBoundingBoxToWorld(), this.node.getBoundingBoxToWorld())) {
            // cc.director.loadScene(this.transToSceneName);
            cc.log("this.playerNode.getBoundingBoxToWorld():" + this.playerNode.getBoundingBoxToWorld());
            cc.log("this.node.getBoundingBoxToWorld():" + this.node.getBoundingBoxToWorld());
         }

     },
});
