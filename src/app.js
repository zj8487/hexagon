
var HelloWorldLayer = cc.Layer.extend({
    ctor:function () {
    		this._super();
    },
    init:function(){
    		this._super();
    		var winsize = cc.director.getWinSize();
    		
    		var centerpos = cc.p(winsize.width / 2, winsize.height /2);
    		
    		var menuItemPlay = cc.MenuItemSprite.create(
    				cc.Sprite.create(res.start_png),
    				cc.Sprite.create(res.start_select_png), 
    				this.onPlay, this );
    		var menu = cc.Menu.create(menuItemPlay);
    		menu.setPosition(centerpos);
    		this.addChild(menu);
    },
    
    onPlay : function() {
		cc.log("按下开始按钮");
		cc.director.runScene(new GameScene());
	}
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        layer.init();
        this.addChild(layer);
    }
});

