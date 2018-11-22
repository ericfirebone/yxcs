//https://github.com/cocos-creator

cc.Class({
    extends: cc.Component,

    properties: {
    
    },


    onLoad: function ()
    {

        var bagLayout = cc.find("Canvas/UI/bagLayout");
        bagLayout.active = false;
    },

    bagClick: function ()
    {
        var bagLayout = cc.find("Canvas/UI/bagLayout");
        if (bagLayout.active==true) {
            
            bagLayout.active = false;
        }else{
      
        bagLayout.active = true;
        }
    },
    closeBagClick: function ()
    {
        var bagLayout = cc.find("Canvas/UI/bagLayout");
        bagLayout.active = false;
    }
});
