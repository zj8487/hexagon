var OFFSET_X = 4,
OFFSET_Y = 32,
ROW = COL = 9,
BLOCK_W = 32,
BLOCK_H = 36,
BLOCK_XREGION = 33,
BLOCK_YREGION = 28,
OFFSET_ODD = 16,
//BLOCK1_RECT = cc.rect(0, 0, BLOCK_W, BLOCK_H),
BLOCK1_RECT = cc.rect(0, 0, BLOCK_W, BLOCK_H),
//BLOCK2_RECT = cc.rect(BLOCK_W, 0, BLOCK_W, BLOCK_H),
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
	//第二种色
	batch2 :null,
	block_tex2 :null,
	//
	player : null,
	player_r : 4,
	player_c : 4,
	moving_action : null,
	trapped_action : null,
	active_nodes : null,
	active_blocks : null,
	choices_nodes :null,
	choices_blocks : null,
	fail_nodes : null,
	fail_block : null,
	trapped : false,
	inited : false,
	step: 0,
	json_touch:null,
	json : null,
	statusLayer:null,
	score:0,
	clicked: false,
	block_Tag : 0,
	
	ctor : function() {
		this._super();
		
		this.anchorX = 0;
		this.anchorY = 0;//..
		this.active_nodes = [];//精灵实例
		this.active_blocks = [];//精灵坐标
		this.choices_nodes = [];//手指碰到的色块实例
		this.choices_blocks = [];//手指碰到的色块坐标
		this.fail_nodes = [];//会下落的色块实例
		this.fail_block = [];//会下落的色块坐标
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
		
		this.batch2 = new cc.SpriteBatchNode(res.block_png, 82);
		this.block_tex2 = this.batch2.texture;
		
		this.batch = new cc.SpriteBatchNode(res.block_green_png, 81);
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
					var boo = target.judge(r,c);
					if (boo) {
//						target.thisTest(r,c);
						target.saveTouchSprite(r,c);
						cc.log("onTouch");
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
					}else {
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
					target.userTouchEnded();
				}
			}
		}, this)
	},
	//清空选中同色数组
	cleanChoices : function () {
		this.choices_nodes=[];
	},
	
	removeSprite : function(r,c){
		cc.log("touch  " + this.json_touch);
		var block = this.json[this.json_touch];
		block.removeFromParent(true);
//		cc.log("remove  r  " + r + " remove c  " + c );
	},
	
	
	userTouchEnded : function() {
		this.tag = 0;
		this.clicked = false;
	},
	
	//保存手指遇到的橙色块
	saveTouchSprite : function(r,c) {
		var block = this.json[r+""+c];
		var tag = block.getTag();
		if (!this.clicked) {
			this.block_Tag = tag;
			cc.log("我按了下去  !!!!" + this.block_Tag + "  " + this.clicked);
			this.clicked = true;
		}
		if (this.choices_nodes.indexOf(block) == -1) {
			cc.log("tag  " + tag  + "   this.tag  " +this.block_Tag + "  clicked  "+ this.clicked);
			if (tag == this.block_Tag) {
				this.choices_nodes.push(block);
				this.choices_blocks.push(r+""+c);
				cc.log("点击后 length  " + this.choices_nodes.length +""+ "");
			}else {
				this.linkRemove();
			}
		}
//		else {
//			this.linkRemove();
//		}
	},
	//色块掉落
	blockFail : function(){
		for (var i = 0; i < this.choices_blocks.length; i++) {
			var coord = parseInt(this.choices_blocks[i]) + 10;
			var block = this.json[coord];
			this.fail_nodes.push(block);
			this.fail_block.push(coord);
		}
		
		for (var i = 0; i < this.fail_nodes.length; i++) {
			this.fail_nodes[i].removeFromParent();
		}
		this.fail_nodes = [];
		
		for (var i = 0; i < this.fail_block.length; i++) {
			var c = this.fail_block[i]%10;
			var r = parseInt(this.fail_block[i]/10);
			this.active_blocks[r][c] = false;
//			this.activateBlock(r, c); 
			this.switchBlcok(r, c);
		}
	},
	
	switchBlcok : function(r,c){
		cc.log("(r%2==1)" + (r%2==1)* OFFSET_ODD + "   "+(r%2==1));
		if (!this.active_blocks[r][c]) {
			var block = new cc.Sprite(this.block_tex2, BLOCK1_RECT);
			block.attr({
				anchorX : 0,
				anchorY : 0,
				x : OFFSET_X + ((r-1)%2==1) * OFFSET_ODD + BLOCK_XREGION * c,
				y : OFFSET_Y + BLOCK_YREGION * (r-1) ,
				
				width : BLOCK_W,
				height : BLOCK_H
			});
			this.json[r+""+c] = block;
			this.active_nodes.push(block);
			this.addChild(block,0, TagOfColor.Orange);
			this.active_blocks[r][c] = true;
			return true;
		}
		return false;
	},
	
	
	
	//连续消除
	linkRemove :  function () {
		for (var i = 0; i < this.choices_nodes.length; i++) {
			this.choices_nodes[i].removeFromParent();
		}
		for (var i = 0; i < this.choices_blocks.length; i++) {
			var c = this.choices_blocks[i]%10;
			var r = parseInt(this.choices_blocks[i]/10);
			this.choices_blocks[r][c] =false;
			cc.log("remove  " + "r  "+ r+ "c"+c);
		}
		this.addScore();
		this.choices_nodes = [];
		this.blockFail();
	},
	//增加分数
	addScore : function() {
		this.score = this.choices_nodes.length;
		this.inserted = true;
		
		var statusLayer = this.getParent().getChildByTag(TagOfLayer.Status);
		cc.log("GameLayer  statusLayer  " + statusLayer);
		statusLayer.addScore(this.choices_nodes.length *10);
		
	},
	//判断是否存在色块
	judge : function(r, c){
		if (!this.active_blocks[r][c]) {
			return false;
		}else {
			return true;
		}
	},
	//连接数是否大于三个
	thanThree : function(){
		if (this.choices_nodes.length >= 3) {
			return true;
		}
		return false;
	},
	//随机出现橙色的块
	initGame : function() {
		this.randomBlocks();

	},
	//随机生成背景块
	randomBlocks : function() {
//		var nb = Math.round(cc.random0To1() * 13) + 7, r, c;
		var nb = ROW * COL, r, c;
		for (var i = 0; i < nb; i++) {
			r = Math.floor(cc.random0To1() * 9);
			c = Math.floor(cc.random0To1() * 9);
			if (i <= (nb-1)/2) {
				if (!this.orangeBlcok(r, c)) {
					i--;
				}
			}else {
				if (!this.activateBlock(r, c)) {
					i--;
				}
			}
		}
		

	},
	//橙色
	orangeBlcok : function(r,c){
		if (!this.active_blocks[r][c]) {
			var block = new cc.Sprite(this.block_tex2, BLOCK1_RECT);
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
			this.addChild(block,0, TagOfColor.Orange);
			this.active_blocks[r][c] = true;
			return true;
		}
		return false;
	},
	
	//绿色
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
			this.addChild(block,0, TagOfColor.Green);
			var tag = block.getTag();
			this.active_blocks[r][c] = true;
			return true;
		}
		return false;
	},
	
});

var GameScene = cc.Scene.extend({
	statusLayer : null,
	onEnter : function() {
		this._super();
		this.addChild(new StatusLayer(),0 , TagOfLayer.Status);
//		layers.game = new GameLayer();
//		this.addChild(layers.game);
//		layers.game.initGame();
		
		var game = new GameLayer();
		this.addChild(game);
		game.initGame();
		
		statusLayer = this.getChildByTag(TagOfLayer.Status);


		var time = 10
		//游戏倒计时
//		this.schedule(function() {
//			time = time-1;
//			statusLayer.redTime(time);
//			if (time <= 0) {
//				cc.director.pause();
//				var scores = statusLayer.getScores();
//				var coins = statusLayer.getCoins();
//				cc.log("StatusLayer   scores  " + scores);
//				
//				this.addChild(new GameOverLayer(),0,TagOfLayer.GameOver);
//				this.getChildByTag(TagOfLayer.GameOver).addCoin(coins);
//				this.getChildByTag(TagOfLayer.GameOver).addScore(scores);
//			}
//		}, 1, 10, 0);
	},
	
});
