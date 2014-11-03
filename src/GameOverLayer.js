var GameOverLayer = cc.LayerColor.extend({
	labelCoin : null,
	labelScore : null,
	coins : 0,
	score : 0,
	// constructor
	ctor:function () {
		this._super();
		this.init();
	},
	init:function () {
		this._super(cc.color(0, 0, 0, 180));
		var winSize = cc.director.getWinSize();

		var centerPos = cc.p(winSize.width / 2, winSize.height / 2);
		cc.MenuItemFont.setFontSize(60);
		var menuItemRestart = cc.MenuItemSprite.create(
				cc.Sprite.create(res.restart_n),
				cc.Sprite.create(res.restart_s),
				this.onRestart, this);
		var menu = cc.Menu.create(menuItemRestart);
		menu.setPosition(centerPos);
		this.addChild(menu);
		
		this.labelCoin = cc.LabelTTF.create("我是分数", "Helvetica", 20 );
		this.labelCoin.setPosition(winSize.width /2-100 , winSize.height /2-70);
		this.addChild(this.labelCoin);
		
		this.labelScore = cc.LabelTTF.create("我是金币", "Helvetica", 20);
		this.labelScore.setPosition(winSize.width/2 +100, winSize.height/2 -70);
		this.addChild(this.labelScore);
	},
	onRestart:function (sender) {
		cc.director.resume();
		cc.director.runScene(new GameScene());
	},
	
	addCoin : function(coins){
		this.coins += coins;
		this.labelCoin.setString("Conins:" + this.coins);
	},
	
	addScore : function(score){
		this.score += score;
		this.labelScore.setString("Score:" + this.score);
	}
});