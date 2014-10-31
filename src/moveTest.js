var moveTest = cc.Scene.extend({
	onEnter : function() {
		this._super();
		
		var size = cc.director.getWinSize();
		
		var center = cc.p(size.width /2, size.height /2);
		
		var containerForSprite1 = new cc.Node();
		var sprite1 = new cc.Sprite("res/block.png");
		sprite1.setPosition(center);
		containerForSprite1.addChild(sprite1);
		this.addChild(containerForSprite1, 10);
		
		var listener1 = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: function (touch, event) {
				var target = event.getCurrentTarget();

				var locationInNode = target.convertToNodeSpace(touch.getLocation());
				var s = target.getContentSize();
				var rect = cc.rect(0, 0, s.width, s.height);

				if (cc.rectContainsPoint(rect, locationInNode)) {
					cc.log("sprite began... x = " + locationInNode.x + ", y = " + locationInNode.y);
					target.opacity = 180;
					return true;
				}
				return false;
			},
			onTouchMoved: function (touch, event) {
				var target = event.getCurrentTarget();
				var delta = touch.getDelta();
				cc.log("delta  " + "x  "+ delta.x + "  y  " + delta.y);
				target.x += delta.x;
				target.y += delta.y;
			},
			onTouchEnded: function (touch, event) {
				var target = event.getCurrentTarget();
				var locationInNode = target.convertToNodeSpace(touch.getLocation());
				cc.log("sprite onTouchesEnded.. ");
				target.setOpacity(255);
			}
		});
		
		cc.eventManager.addListener(listener1, sprite1);
	}
});