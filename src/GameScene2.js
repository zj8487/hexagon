//监听block
var OFFSET_X = 4,
OFFSET_Y = 32,
ROW = COL = 13,
BLOCK_W = 32,
BLOCK_H = 36,
BLOCK_XREGION = 33,
BLOCK_YREGION = 28,
OFFSET_ODD = 16,
BLOCK1_RECT = cc.rect(0, 0, BLOCK_W, BLOCK_H),
BLOCK2_RECT = cc.rect(BLOCK_W, 0, BLOCK_W, BLOCK_H),
PLAYER_W = 66,
PLAYER_H = 118,
PLAYER_OX = 0,
MOVING_OY = 118,
TRAPPED_OY = 0,
START_UI_SIZE = cc.size(256, 454),
FAIL_UI_SIZE = cc.size(292, 277),
WIN_UI_SIZE = cc.size(308, 276);

var layers = {};

var GameLayer = cc.Layer.extend({
	blocks : null,
	batch : null,
	block_tex : null,
	player : null,
	player_r : 4,
	player_c : 4,
	moving_action : null,
	trapped_action : null,
	active_blocks : null,
	trapped : false,
	inited : false,
	active_nodes : null,
	step: 0,
	json : null,

	ctor : function() {
		this._super();

		this.anchorX = 0;
		this.anchorY = 0;//..
		this.active_nodes = [];//精灵实例
		this.active_blocks = [];//精灵坐标
		this.json = {};
		for (var r = 0; r < ROW; r++) {
			this.active_blocks.push([]);
			for (var c = 0; c < COL; c++) {
				this.active_blocks[r][c] = false;
			}
		}

		this.blocks = new cc.Layer();
		this.blocks.x = OFFSET_X;
		this.blocks.y = OFFSET_Y;
		this.addChild(this.blocks);

		this.batch = new cc.SpriteBatchNode(res.block_png, 81);
		this.block_tex = this.batch.texture;
		var ox = x = y = 0, odd = false, block, tex = this.batch.texture;
		for (var r = 0; r < ROW; r++) {
			y = BLOCK_YREGION * r;
			ox = odd * OFFSET_ODD;
			for (var c = 0; c < COL; c++) {
				x = ox + BLOCK_XREGION * c;
				block = new cc.Sprite(tex, BLOCK2_RECT);
				block.attr({
					anchorX : 0,
					anchorY : 0,
					x : x,
					y : y,
					width : BLOCK_W,
					height :BLOCK_H
				});
				this.batch.addChild(block);
			}
			odd = !odd;
		}
		this.blocks.addChild(this.batch);
		this.blocks.bake();
		
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			onTouchBegan: function(touch, event){
				var target = event.getCurrentTarget();
				var pos = target.convertToNodeSpace(touch.getLocation());
				var s = target.getContentSize();
				var rect = cc.rect(0, 0, s.width, s.height);

				if (cc.rectContainsPoint(rect, pos)) {
					target.opacity = 180;
					pos.y -= OFFSET_Y;
					var r = Math.floor(pos.y / BLOCK_YREGION);
					pos.x -= OFFSET_X + (r%2==1) * OFFSET_ODD;
					var c = Math.floor(pos.x / BLOCK_XREGION);
					cc.log("全局监听   r ===" + r + "  c===" + c  + "  x == " + pos.x + "  y ==" + pos.y);
//					var boo = target.judge(r,c);
//					if (boo) {
//						target.thisTest(r,c);
//					}
					return true;
				}
				return false;
			},
			onTouchMoved: function(touch, event) {
				var target = event.getCurrentTarget();
				var delta = touch.getDelta();
			},
			onTouchEnded : function(touch, event){
				var target = event.getCurrentTarget();
				var pos = target.convertToNodeSpace(touch.getLocation());
				var s = target.getContentSize();
				var rect = cc.rect(0, 0, s.width, s.height);
				if (cc.rectContainsPoint(rect, pos)) {
					target.opacity = 180;
					pos.y -= OFFSET_Y;
					var r = Math.floor(pos.y / BLOCK_YREGION);
					pos.x -= OFFSET_X + (r%2==1) * OFFSET_ODD;
					var c = Math.floor(pos.x / BLOCK_XREGION);
//					cc.log("pos  " + r + "  yyy  " + c);
					target.activateBlock(r, c);
				}
			}
		}, this)
	},

	thisTest : function(r,c){
//		var r = this.json[r + c];
//		cc.log("r  " + r);
		var block = this.json[r + c];
		block.removeFromParent(true);
		cc.log("began  r  " + r + " began c  " + c);
	},

	judge : function(r, c){
		if (!this.active_blocks[r][c]) {
			cc.log("不存在橙色矩形");
			return false;
		}else {
			return true;
		}
	},
	//随机出现橙色的块
	initGame : function() {
		for (var i = 0, l = this.active_nodes.length; i < l; i++) {
			this.active_nodes[i].removeFromParent();
		}
		this.active_nodes = [];
		this.randomBlocks();


	},

	randomBlocks : function() {
		cc.log("init random Blocks");
		var nb = Math.round(cc.random0To1() * 13) + 7, r, c;
		for (var i = 0; i < nb; i++) {
			r = Math.floor(cc.random0To1() * 9);
			c = Math.floor(cc.random0To1() * 9);
			this.activateBlock(r, c);
		}
	},

	activateBlock : function(r, c) {
		if (!this.active_blocks[r][c]) {
			var block = new cc.Sprite(this.block_tex, BLOCK1_RECT);
			block.attr({
				anchorX : 0,
				anchorY : 0,
				x : OFFSET_X + (r%2==1) * OFFSET_ODD + BLOCK_XREGION * c,
				y : OFFSET_Y + BLOCK_YREGION * r,
				width : BLOCK_W,
				height : BLOCK_H
			});
			var listener_orange = cc.EventListener.create({
				event: cc.EventListener.TOUCH_ONE_BY_ONE,
				onTouchBegan: function(touch, event){
//					var target = event.getCurrentTarget();
//					var pos = target.convertToNodeSpace(touch.getLocation());
//					var s = target.getContentSize();
//					var rect = cc.rect(0, 0, s.width, s.height);
//					if (cc.rectContainsPoint(rect, pos)) {
//						target.opacity = 180;
					
//						pos.y -= OFFSET_Y;
//						var r = Math.floor(pos.y / BLOCK_YREGION);
//						pos.x -= OFFSET_X + (r%2==1) * OFFSET_ODD;
//						var c = Math.floor(pos.x / BLOCK_XREGION);
//						cc.log("单个监听  r == " + r +   "   c===  " +
//								c+ "x  " + pos.x + "  y  " + pos.y);
//						return true;
//					}
//					return false;

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
					var locationInNode = target.convertToNodeSpace(touch.getLocation());
					cc.log("sprite move... x = " + locationInNode.x + ", y = " + locationInNode.y);
//					target.x += delta.x;
//					target.y += delta.y;
				},
				onTouchEnded: function (touch, event) {
					var target = event.getCurrentTarget();
					target.opacity = 255;
					var locationInNode = target.convertToNodeSpace(touch.getLocation());
					var s = target.getContentSize();
					var rect = cc.rect(0, 0, s.width, s.height);
					if (cc.rectContainsPoint(rect, locationInNode)) {
//						cc.log("sprite began... x = " + locationInNode.x + ", y = " + locationInNode.y);
						
						target.opacity = 180;
						return true;
					}
					return false;
				}
			});
			
			cc.eventManager.addListener(listener_orange, block);
//			cc.log("r  " + r + "  c  " +c);
			this.active_nodes.push(block);
			this.addChild(block, 2);
			this.active_blocks[r][c] = true;
			return true;
		}
		return false;
	},
});

var GameScene2 = cc.Scene.extend({
	onEnter : function() {
		this._super();
		cc.log("init GameScene2");
		layers.game = new GameLayer();
//		var layer = new GameLayer();
		this.addChild(layers.game);
		layers.game.initGame();
	}
});
