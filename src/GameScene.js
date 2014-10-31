var OFFSET_X = 4,
OFFSET_Y = 32,
ROW = COL = 9,
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
	json_touch:null,
	json : null,
	choices_blocks :null,
	statusLayer:null,
	score:0,
	inserted: false,
	
	ctor : function() {
		this._super();
		
		this.anchorX = 0;
		this.anchorY = 0;//..
		this.active_nodes = [];//精灵实例
		this.active_blocks = [];//精灵坐标
		this.choices_blocks = [];//手指碰到的方块
		this.json = {};
//		var json = {};
//		json["key1"] = "value1";
//		json["key2"] = "value2";
//		var json2 = {};
//		json2.key1 = "xwkkx";
//		json2.key2 = "xyf";
//		var json3 = {};
//		json3[1] = "one";
//		json3[2] = "two";
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
				cc.log("began  target.x  " + target.x + "began   target.y  " + target.y);
				var pos = target.convertToNodeSpace(touch.getLocation());
				var s = target.getContentSize();
				var rect = cc.rect(0, 0, s.width, s.height);

				if (cc.rectContainsPoint(rect, pos)) {
					target.opacity = 180;
					pos.y -= OFFSET_Y;
					var r = Math.floor(pos.y / BLOCK_YREGION);
					pos.x -= OFFSET_X + (r%2==1) * OFFSET_ODD;
					var c = Math.floor(pos.x / BLOCK_XREGION);
					var boo = target.judge(r,c);
					if (boo) {
//						target.thisTest(r,c);
						target.saveTouchSprite(r,c);
					}
					return true;
				}
				return false;
			},
			onTouchMoved: function(touch, event) {
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
					var boo = target.judge(r,c);
					var boo_three = target.thanThree();
					if (boo) {
						target.saveTouchSprite(r,c);
//						if (boo_three) {
//							cc.log("可以消除  ");
//							target.linkRemove();
//						}
					}else {
						//如果choices_blocks[]中元素大于三个,删除
						cc.log("遇到非橙色块");
						if (boo_three) {
							target.linkRemove();
						}
					}
				}
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
//					target.activateBlock(r, c);
					var boo_three = target.thanThree();
					if (boo_three) {
						target.linkRemove();
					}else {
						target.cleanChoices();
					}
				}
			}
		}, this)
	},
	//清空选中同色数组
	cleanChoices : function () {
		this.choices_blocks=[];
	},
	
	removeSprite : function(r,c){
		cc.log("touch  " + this.json_touch);
		var block = this.json[this.json_touch];
		block.removeFromParent(true);
//		cc.log("remove  r  " + r + " remove c  " + c );
	},
	//保存手指遇到的橙色块
	saveTouchSprite : function(r,c) {
//		this.json_touch = r +""+ c;
		cc.log("init length  " + this.choices_blocks.length);
		var block = this.json[r+""+c];
//		if (!this.choices_blocks[r][c]) {
//			this.choices_blocks.push(block);
//			this.choices_blocks[r][c] = true;
//			cc.log("保存block  r" + r + "  c  " + c +  + "   " + this.choices_blocks.length);
//		}
		if (this.choices_blocks.indexOf(block) == -1) {
			this.choices_blocks.push(block);
			cc.log("点击后 length  " + this.choices_blocks.length +""+ "");
		}
	},
	
	
	//连续消除
	linkRemove :  function () {
		for (var i = 0; i < this.choices_blocks.length; i++) {
			this.choices_blocks[i].removeFromParent();
		}
		this.addScore();
		this.choices_blocks = [];
	},
	//增加分数、金币
	addScore : function() {
		this.score = this.choices_blocks.length;
		this.inserted = true;
		
		var statusLayer = this.getParent().getChildByTag(TagOfLayer.Status);
		cc.log("GameLayer  statusLayer  " + statusLayer);
		statusLayer.addScore(this.choices_blocks.length *10);
		
	},
	//判断是否存在橙色块
	judge : function(r, c){
		if (!this.active_blocks[r][c]) {
			return false;
		}else {
			return true;
		}
	},
	//连接数是否大于三个
	thanThree : function(){
		cc.log("length  " + this.choices_blocks.length);
		if (this.choices_blocks.length >= 3) {
			return true;
		}
		return false;
	},
	//随机出现橙色的块
	initGame : function() {
		for (var i = 0, l = this.active_nodes.length; i < l; i++) {
			this.active_nodes[i].removeFromParent();
			
		}
		this.active_nodes = [];
		this.randomBlocks();
		

	},
	//随机生成背景块
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
			this.json[r+""+c] = block;
			this.active_nodes.push(block);
			this.addChild(block, 2);
			this.active_blocks[r][c] = true;
//			this.removeManyBlock(r, c, block);
			return true;
		}
		return false;
	},
	
});

var GameScene = cc.Scene.extend({
	inserted :false,
	onEnter : function() {
		this._super();
		this.addChild(new StatusLayer(),0 , TagOfLayer.Status);
//		layers.game = new GameLayer();
//		this.addChild(layers.game);
//		layers.game.initGame();
		
		var game = new GameLayer();
		this.addChild(game);
		game.initGame();
		var statusLayer = this.getChildByTag(TagOfLayer.Status);
		cc.log("statusLayer is exists?  " + statusLayer + "");
		
		var time = 10
		this.schedule(function() {
			time = time-1;
			statusLayer.redTime(time);
			if (time <= 0) {
				cc.director.pause();
				this.addChild(new GameOverLayer(),0,TagOfLayer.GameOver);
			}
		}, 1, 13, 0);
//		this.scheduleUpdate();
	},
	
});
