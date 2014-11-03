var StatusLayer = cc.Layer.extend({
	labelCoin:null,
	labelScore:null,
	labelTime:null,
	conis:0,
	score:0,
	time:30,
	
	ctor :function(){
		this._super();
		this.init();
	},

	init : function(){
		this._super();
		
		var winsize = cc.director.getWinSize();
		this.labelCoin = cc.LabelTTF.create("Coins:0", "Helvetica", 20);
		this.labelCoin.setPosition(cc.p(70, winsize.height - 20));
		this.addChild(this.labelCoin);
		
		this.labelScore = cc.LabelTTF.create("Score:0", "Helvetica", 20);
		this.labelScore.setPosition(cc.p(winsize.width - 70, winsize.height - 20));
		this.addChild(this.labelScore);
		
		this.labelTime = cc.LabelTTF.create("Time: 10" ,"Helvetica", 20);
		this.labelTime.setPosition(cc.p(winsize.width /2, winsize.height -20));
		this.addChild(this.labelTime);
	},
	
	addCoin : function(num) {
		num = num +1;
		this.conis += num;
		this.labelCoin.setString("Conis:" + this.conis);
		
	},
	
	getCoins : function(){
		return this.conis;
	},
	
	addScore : function(score){
		this.score += score;
		this.labelScore.setString("Score:" + this.score);
		cc.log("增加分数   " + this.score);
	},
	
	getScores : function(){
		return this.score;
	},
	
	
	//倒计时
	redTime : function(time) {
		if (time <= 0) {
			this.labelTime.setString("GameOver");
			return;
		}else {
			this.labelTime.setString("Time:" + time);
		}
	}
});