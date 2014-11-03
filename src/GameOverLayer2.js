var GameOverLayer2 = cc.LayerColor.extend({
	labelCoin : null,
	labelScore : null,
	// constructor
	ctor:function () {
		this._super();
		this.init();
	},
	init:function () {
		this._super();
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
		this.labelCoin.setPosition(cc.p(winSize.width/2,
				winSize.height/2 - 20));
		this.addChild(this.labelCoin);
	},
	onRestart:function (sender) {
		cc.director.resume();
		cc.director.runScene(new GameScene());
	}
});