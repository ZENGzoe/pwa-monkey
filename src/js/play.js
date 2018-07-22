var game;
var savedData;

var gameOptions = {
  gameHeight: 1334,
  backgroundColor: 0x08131a,
  visibleTargets: 9,//一屏显示数量
  ballDistance: 176,//目标与目标之间的距离
  rotationSpeed: 5,//旋转速度
  angleRange: [25, 155],
  localStorageName: "gameScore"
}

window.onload = function() {
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;
  if(windowWidth > windowHeight){
      windowWidth = windowHeight / 1.8;
  }
  var gameWidth = windowWidth * gameOptions.gameHeight / windowHeight;
  game = new Phaser.Game(gameWidth, gameOptions.gameHeight, Phaser.CANVAS);
  game.state.add("Boot", boot);
  game.state.add("Preload", preload);
  game.state.add("TitleScreen", titleScreen);
  game.state.add("PlayGame", playGame);
  game.state.start("Boot");
}

var boot = function(game){};
boot.prototype = {
  preload: function(){
    //game.load.image('loading','preloader.gif'); //加载进度条图片资源
  },
  create: function(){
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.disableVisibilityChange = true;
    game.stage.backgroundColor = gameOptions.backgroundColor;
    game.state.start("Preload");
  }
}

//加载页面
var preload = function(game){};
preload.prototype = {
  preload: function(){
    game.load.image("playbutton", "img/playbutton.png");
    game.load.image("ball", "img/ball.png");
    game.load.image("target", "img/target3.png");//目标
    game.load.image("arm", "img/arm3.png");
    game.load.image("homebutton", "img/homebutton.png");
    game.load.image("fog", "img/fog.png");//顶部遮罩
    game.load.image('leaf','img/leaf2.png');
    game.load.image('bg','img/bg.jpg');
    // game.load.bitmapFont("font", "img/font.png", "img/font.fnt");//字体
    // game.load.bitmapFont("whitefont", "img/whitefont.png", "img/whitefont.fnt");//字体
    // game.load.audio("failsound", ["img/fail.mp3", "img/fail.ogg"]);
    // game.load.audio("hitsound", ["img/hit.mp3", "img/hit.mp3"]);
    // game.load.audio("hit2sound", ["img/hit2.mp3", "img/hit2.ogg"]);
  },
  create: function(){
    game.state.start("TitleScreen");//加载完成后进入开始页面
  }
}

//开始页面
var titleScreen = function(game){};

titleScreen.prototype = {
  create: function(){
    savedData = localStorage.getItem(gameOptions.localStorageName) == null ? {score: 0} : JSON.parse(localStorage.getItem(gameOptions.localStorageName));//获取已保存的分数
    var playButton = game.add.button(game.width / 2, game.height / 2, "playbutton", this.startGame);
    playButton.anchor.set(0.5);
    var tween = game.add.tween(playButton.scale).to({
      x: 0.8,
      y: 0.8
    }, 500, Phaser.Easing.Linear.None, true, 0, -1);
    tween.yoyo(true);
    game.add.text(game.width / 2, game.height - 50, savedData.score.toString(), { font : '60px Arial' , fill : '#ffffff'}).anchor.set(0.5, 1);
    game.add.text(game.width / 2, game.height - 110, "BEST SCORE", { font : '48px Arial' , fill : '#ffffff'}).anchor.set(0.5, 1);
    // game.add.bitmapText(game.width / 2, game.height - 50, "whitefont", savedData.score.toString(), 60).anchor.set(0.5, 1);
    // game.add.bitmapText(game.width / 2, game.height - 110, "font", "BEST SCORE", 48).anchor.set(0.5, 1);
  },
  startGame: function(){
    game.state.start("PlayGame");
  }
}

//游戏页面
var playGame = function(game){};

playGame.prototype = {
  //初始化游戏
  create: function(){
    // this.failSound = game.add.audio("failsound");
    // this.hitSound = [game.add.audio("hitsound"), game.add.audio("hit2sound")];
    var bg = game.add.sprite(0,0,'bg');
    bg.width = game.width;
    bg.height = game.height;
    this.runUpdate = true;
    this.score = 0;
    this.destroy = false;
    this.rotationSpeed = gameOptions.rotationSpeed;
    this.targetArray = [];
    this.leafArray = [];
    this.steps = 0;
    this.armMove = true;
    this.canClick = true;
    // this.rotatingDirection = game.rnd.between(0, 1);
    this.rotatingDirection = 1;
    this.gameGroup = game.add.group();
    this.leafGroup = game.add.group();
    this.targetGroup = game.add.group();
    this.ballGroup = game.add.group();
    this.gameGroup.add(this.leafGroup);
    this.gameGroup.add(this.targetGroup);
    this.gameGroup.add(this.ballGroup);
    this.arm = game.add.sprite(game.width / 2, 900, "arm");
    //14 61
    this.arm.anchor.set(17/200, 50/95);
    this.armBasicAngle = 90;
    this.arm.angle = this.armBasicAngle;
    this.ballGroup.add(this.arm);
    this.balls = [
      game.add.sprite(game.width / 2, 900, "ball"),
      game.add.sprite(game.width / 2, 900 + gameOptions.ballDistance, "ball")
    ]
    this.balls[0].anchor.set(0.5);
    this.balls[1].anchor.set(0.5);
    this.balls[0].alpha = 0;
    this.balls[1].alpha = 0;
    this.ballGroup.add(this.balls[0]);
    this.ballGroup.add(this.balls[1]);
    this.rotationAngle = 0;
    this.rotatingBall = 1;
    var target = game.add.sprite(0, 0, "target");
    target.anchor.set(0.5);
    target.x = this.balls[0].x;
    target.y = this.balls[0].y;
    this.targetGroup.add(target);
    this.targetArray.push(target);
    game.input.onDown.add(this.changeBall, this);
    for(var i = 0; i < gameOptions.visibleTargets; i++){
      this.addTarget();
    }
    this.homeButton = game.add.button(game.width / 2, game.height, "homebutton", function(){
      game.state.start("TitleScreen");
    });
    this.homeButton.anchor.set(0.5, 1);
    // var fog = game.add.image(0, 0, "fog");
    // fog.width = game.width;

    //左上角分数
    // this.scoreText = game.add.bitmapText(20, 20, "whitefont", "0", 60);
    this.scoreText = game.add.text(20, 20, '0', { font : '60px Arial' , fill : '#ffffff'});
  },
  //实时刷新页面
  update: function(){
    // game.world.bringToTop(this.targetGroup);
    if(this.runUpdate){
      var distanceFromTarget = this.balls[this.rotatingBall].position.distance(this.targetArray[1].position);
      if(distanceFromTarget > 90 && this.destroy && this.steps > gameOptions.visibleTargets){//这里不让它循环旋转超出范围
        var ohnoText = game.add.text(0, 100, "TOO LATE!!", { font : '60px Arial',fill : '#ffffff'});
        ohnoText.anchor.set(0.5);
        this.targetArray[0].addChild(ohnoText);
        this.gameOver();
      }
      if(distanceFromTarget < 25 && !this.destroy){
        this.destroy = true;
      }
      this.rotationAngle = (this.rotationAngle + this.rotationSpeed * (this.rotatingDirection * 2 - 1)) % 360;
      if(this.armMove){
        this.arm.angle = this.rotationAngle + this.armBasicAngle;
      }
      
      this.balls[this.rotatingBall].x = this.balls[1 - this.rotatingBall].x - gameOptions.ballDistance * Math.sin(Phaser.Math.degToRad(this.rotationAngle));
      this.balls[this.rotatingBall].y = this.balls[1 - this.rotatingBall].y + gameOptions.ballDistance * Math.cos(Phaser.Math.degToRad(this.rotationAngle));
      var distanceX = this.balls[1 - this.rotatingBall].worldPosition.x - game.width / 2;
      var distanceY = this.balls[1 - this.rotatingBall].worldPosition.y - 900;
      if(this.armMove){
        this.gameGroup.x = Phaser.Math.linearInterpolation([this.gameGroup.x, this.gameGroup.x - distanceX], 0.05);
        this.gameGroup.y = Phaser.Math.linearInterpolation([this.gameGroup.y, this.gameGroup.y - distanceY], 0.05);
      }
      
    }
  },
  //每一步的操作
  changeBall:function(e){
    if(!this.canClick) return false;

    this.canClick = false;
    var homeBounds = this.homeButton.getBounds();
    if(homeBounds.contains(e.position.x, e.position.y)){
      return;
    }
    // this.hitSound[this.rotatingBall].play();
    this.destroy = false;
    //distanceFromTarget 目标距离判断
    var distanceFromTarget = this.balls[this.rotatingBall].position.distance(this.targetArray[1].position);
    if(distanceFromTarget < 60){//这里调整距离判断（是否在圆内）
      var points = Math.floor((40 - distanceFromTarget) / 2);
      // this.score += points;
      this.score++;
      this.scoreText.text = this.score.toString();
      // this.rotatingDirection = game.rnd.between(0, 1);
      this.rotatingDirection = this.rotatingDirection == 1 ? 0 : 1;
      // this.rotatingDirection = 1;
      var fallingTarget = this.targetArray.shift();
      var fallingLeaf = this.leafArray.shift();
      fallingLeaf.destroy();
      var tween = game.add.tween(fallingTarget).to({
        alpha: 0,
        width: 0,
        height: 0
      }, 2500, Phaser.Easing.Cubic.Out, true);
      tween.onComplete.add(function(target){
          target.destroy();

      }, this)
      this.rotatingDirection == 0 ? this.arm.anchor.set(183/200, 50/95) : this.arm.anchor.set(17/200, 50/95);
      this.arm.position = this.balls[this.rotatingBall].position;
      this.rotatingBall = 1 - this.rotatingBall;
      this.rotationAngle = this.balls[1 - this.rotatingBall].position.angle(this.balls[this.rotatingBall].position, true) - 90;
      this.armBasicAngle = this.rotatingDirection == 0 ? -90 : 90; 
      this.arm.angle = this.rotationAngle + this.armBasicAngle;
      this.addTarget();
    }
    else{
      var gameH = game.height + 1000,
          gameGroupY = this.gameGroup.y;
      this.armMove = false;

      var armDie = game.add.tween(this.arm).to({
        y : gameH,
        width : 70,
        height : 30
      } , 1500, Phaser.Easing.Cubic.Out, true);

      var ohnoText = game.add.text(0, 100, "啊！！！！", { font : '65px Arial' , fill : '#ffffff'});
      ohnoText.anchor.set(0.5);
      this.targetArray[0].addChild(ohnoText);

      var gameGroupMove = game.add.tween(this.gameGroup).to({
        y : gameGroupY + 30
      } , 300 , Phaser.Easing.Quadratic.In , true);
      gameGroupMove.onComplete.add(function(target){
        game.add.tween(this.gameGroup).to({
          y : gameGroupY
        }, 1000 , Phaser.Easing.Quadratic.Out , true)
      },this)


      armDie.onComplete.add(function(target){
        target.destroy();
        ohnoText.text = 'Game Over!';
        // var ohnoText = game.add.text(0, 100, "Game Over!", { font : '65px Arial' , fill : '#ffffff'});
        // ohnoText.anchor.set(0.5);
        this.targetArray[0].addChild(ohnoText);
        this.gameOver();
      },this);
      
    }
  },
  //新增下一步的目标，默认会刷新visibleTargets的数量，每次成功到达下一步都会新增一个
  addTarget: function(){
    var startX, startY;
    this.steps++;
    startX = this.targetArray[this.targetArray.length - 1].x;
    startY = this.targetArray[this.targetArray.length - 1].y;
    var randomAngle = game.rnd.between(gameOptions.angleRange[0] + 90, gameOptions.angleRange[1] + 90);//生成路径方向

    var leaf = game.add.sprite(0,0,'leaf');
    leaf.anchor.set(17/31,1);
    leaf.x = startX;
    leaf.y = startY + 20;
    leaf.angle = 180 - randomAngle;

    var target = game.add.sprite(0, 0, "target");
    target.anchor.set(0.5);
    target.x = startX + gameOptions.ballDistance * Math.sin(Phaser.Math.degToRad(randomAngle));
    target.y = startY + gameOptions.ballDistance * Math.cos(Phaser.Math.degToRad(randomAngle));

    // 序数 显示第几个目标
    // var stepText = game.add.bitmapText(0, 0, "whitefont", this.steps.toString(), 32);
    // stepText.anchor.set(0.5);
    // target.addChild(stepText);
    this.leafGroup.add(leaf);
    this.targetGroup.add(target);
    this.targetArray.push(target);
    this.leafArray.push(leaf);
    this.canClick = true;
  },
  //游戏结束
  gameOver: function(){
    // this.failSound.play();
    var finalSteps = this.steps - gameOptions.visibleTargets;
    // this.scoreText.text = this.score.toString() + " * " + finalSteps + " = " + (this.score * finalSteps).toString();
    // this.score *= finalSteps;
    //保存分数到本地存储
    localStorage.setItem(gameOptions.localStorageName,JSON.stringify({
      score: Math.max(savedData.score, this.score)
    }));
    this.runUpdate = false;
    game.input.onDown.remove(this.changeBall, this);
    this.rotationSpeed = 0;
    this.arm.destroy();
    var gameOverTween = game.add.tween(this.balls[1 - this.rotatingBall]).to({
      alpha: 0
    }, 1500, Phaser.Easing.Cubic.Out, true);
    gameOverTween.onComplete.add(function(){
      game.state.start("PlayGame");
    },this);
  }
}