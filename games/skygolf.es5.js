function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
title = "";
description = "\n";
characters = ["\n ll\nllll\nllll\n ll\n "];
options = {
  viewSize: {
    x: 150,
    y: 100
  },
  isShowingScore: false,
  seed: 1
};
var state;
var platforms;
var ball;
var ballCount;
var holeCount;
var courseDifficulty;
var instructionTicks;
var holeStartingTicks;
var courseTime;
function update() {
  if (!ticks) {
    document.title = "SKY GOLF";
    instructionTicks = 200;
    initTitle();
  }
  if (state === "title") {
    updateTitle();
  } else if (state === "inGame") {
    updateInGame();
  } else if (state === "goToNextHole") {
    updateGoToNextHole();
  } else if (state === "giveUp") {
    updateGiveUp();
  } else if (state === "holeOut") {
    updateHoleOut();
  }
}
var easyButton;
var mediumButton;
var hardButton;
function initTitle() {
  state = "title";
  easyButton = getButton({
    text: "Easy",
    pos: {
      x: 15,
      y: 45
    },
    size: {
      x: 50,
      y: 7
    },
    isToggle: false,
    onClick: function onClick() {
      return initInGame(0);
    }
  });
  mediumButton = getButton({
    text: "Medium",
    pos: {
      x: 15,
      y: 55
    },
    size: {
      x: 50,
      y: 7
    },
    isToggle: false,
    onClick: function onClick() {
      return initInGame(1);
    }
  });
  hardButton = getButton({
    text: "Hard",
    pos: {
      x: 15,
      y: 65
    },
    size: {
      x: 50,
      y: 7
    },
    isToggle: false,
    onClick: function onClick() {
      return initInGame(2);
    }
  });
  initBall();
  createHole(103);
}
function updateTitle() {
  drawHole();
  color("black");
  text("SKY GOLF", 9, 38);
  updateButton(easyButton);
  text("3 holes", 75, 48);
  updateButton(mediumButton);
  text("6 holes", 75, 58);
  updateButton(hardButton);
  text("9 holes", 75, 68);
  text("Click button to start", 20, 79);
}
var bgmSeeds = [1013, 1023, 1024];
function initInGame(_difficulty) {
  courseDifficulty = _difficulty;
  ballCount = 0;
  holeCount = 0;
  courseTime = 0;
  goToNextHole();
}
function updateInGame() {
  drawHole();
  color(ball.state === "shot" && ball.basePower < 1 ? "yellow" : "black");
  char("a", ball.pos);
  if (ball.state === "shot") {
    updateShotState();
  } else if (ball.state === "power") {
    sss.stopMml();
    updatePowerState();
  } else if (ball.state === "fly") {
    updateFlyState();
  }
  color("black");
  if (instructionTicks > 0) {
    instructionTicks--;
    text("[Hold] to adjust power", 20, 60);
    text("[Release] to shoot", 20, 68);
  }
  if (holeStartingTicks > 0) {
    holeStartingTicks--;
    text("HOLE ".concat(holeCount), 10, 95);
  }
  courseTime++;
  drawBallAndTime();
}
function drawBallAndTime() {
  color("black");
  char("a", 3, 4);
  text("x".concat(ballCount), 9, 3);
  drawTime(courseTime, 110, 3);
}
var holeSeeds = [[71, 45, 9], [49, 7, 98, 31, 54, 99], [15, 4, 67, 5, 90, 53, 79, 85, 78]];
function goToNextHole() {
  state = "inGame";
  initBall();
  createHole(holeSeeds[courseDifficulty][holeCount]);
  ball.prevPos.set(ball.pos);
  holeStartingTicks = 120;
  holeCount++;
  ballCount += 5;
  initBallShotState();
}
function initBall() {
  ball = {
    pos: vec(5, 83),
    prevPos: vec(),
    vel: vec(),
    angle: 0,
    angleVel: -1,
    power: 0,
    basePower: 1,
    prevBasePower: 1,
    state: "shot"
  };
}
function updateShotState() {
  ball.angle += ball.angleVel * 0.05;
  if (ball.angle < -PI && ball.angleVel < 0 || ball.angle > 0 && ball.angleVel > 0) {
    ball.angleVel = -ball.angleVel;
    ball.angle += ball.angleVel * 0.05 * 2;
  }
  color("light_black");
  line(ball.pos, vec(ball.pos).addWithAngle(ball.angle, 9), 2);
  if (input.isJustPressed) {
    sss.stopMml();
    play("select");
    ball.state = "power";
  }
}
function updatePowerState() {
  ball.power += 0.2;
  color("light_black");
  line(ball.pos, vec(ball.pos).addWithAngle(ball.angle, ball.power), 2);
  if (ball.power > 9 || input.isJustReleased) {
    play("laser");
    ball.vel.set().addWithAngle(ball.angle, ball.power * 0.5 * ball.basePower);
    ball.state = "fly";
    ballCount--;
  }
}
function updateFlyState() {
  var p = vec();
  color("transparent");
  p.set(ball.pos).add(ball.vel.x, 0);
  var ch = char("a", p).isColliding.rect;
  if (ch.red || ch.green || ch.yellow || ch.blue || ball.vel.x < 0 && ball.pos.x < 2 || ball.vel.x > 0 && ball.pos.x > 148) {
    ball.vel.x *= -0.8;
    ball.vel.y *= 0.8;
  }
  p.set(ball.pos).add(0, ball.vel.y);
  var cv = char("a", p).isColliding.rect;
  if (cv.red || cv.green || cv.yellow || cv.blue) {
    var vr = 0.8;
    if (ball.vel.y > 0 && cv.blue) {
      play("click");
      vr = 0.4;
      color("blue");
      particle(ball.pos.x, ball.pos.y + 2, 3, 1, -PI / 2, PI / 4);
    } else if (ball.vel.y > 0 && cv.yellow) {
      play("click");
      vr = 0.5;
      color("yellow");
      particle(ball.pos.x, ball.pos.y + 2, 3, 1, -PI / 2, PI / 4);
    } else {
      play("hit");
    }
    ball.vel.y *= -vr;
    ball.vel.x *= vr;
    if (ball.vel.y < 0 && ball.vel.length < 0.5) {
      if (cv.white) {
        initGoToNextHole();
        return;
      } else if (ballCount <= 0) {
        initGiveUp();
        return;
      }
      initBallShotState();
      ball.basePower = cv.yellow ? 0.5 : 1;
      if (cv.blue) {
        color("blue");
        particle(ball.pos.x, ball.pos.y + 2, 9, 0.5, -PI / 2, PI / 2);
        backToPrevBallPos();
      }
      ball.prevPos.set(ball.pos);
      ball.prevBasePower = ball.basePower;
      return;
    }
  }
  ball.pos.add(ball.vel);
  ball.vel.mul(0.98);
  ball.vel.y += 0.1;
  if (ball.pos.y > 110) {
    if (ballCount <= 0) {
      initGiveUp();
      return;
    }
    backToPrevBallPos();
    initBallShotState();
  }
}
function backToPrevBallPos() {
  play("explosion");
  ball.pos.set(ball.prevPos);
  ball.basePower = ball.prevBasePower;
}
function initBallShotState() {
  ball.state = "shot";
  ball.power = 0.1;
  sss.playMml(sss.generateMml({
    seed: bgmSeeds[courseDifficulty]
  }));
}
function drawHole() {
  platforms.forEach(function (p, i) {
    color("red");
    rect(p.pos.x, p.pos.y, p.grounds.length * 6, -2);
    var pgt = p.grounds[0].type;
    var x = p.pos.x;
    var bx = p.pos.x;
    p.grounds.forEach(function (g) {
      if (g.type !== pgt) {
        drawGround(bx, p.pos.y - 2, x - bx, pgt);
        bx = x;
        pgt = g.type;
      }
      if (g.type === "tree") {
        drawTree(x, p.pos.y - 5, g.height);
      } else if (g.type === "flag") {
        drawFlag(x, p.pos.y - 5);
      }
      x += 6;
    });
    drawGround(bx, p.pos.y - 2, x - bx, pgt);
  });
}
var groundColors = {
  fairway: "green",
  sand: "yellow",
  water: "blue",
  tree: "green",
  flag: "white"
};
function drawGround(x, y, w, type) {
  color(groundColors[type]);
  rect(x, y, w, -3);
}
function drawTree(x, y, h) {
  var h2 = floor(h / 2);
  color("red");
  rect(x + 1, y, 3, -h2);
  color("green");
  rect(x, y - h2, 5, -h2);
}
function drawFlag(x, y) {
  color("light_yellow");
  rect(x + 1, y, 2, -10);
  color("light_red");
  rect(x + 3, y - 6, 5, -4);
}
var goToNextHoleTicks;
function initGoToNextHole() {
  if (holeCount === holeSeeds[courseDifficulty].length) {
    initHoleOut();
    return;
  }
  sss.playMml(sss.generateMml({
    seed: 1,
    noteLength: 16,
    partCount: 2,
    drumPartRatio: 0
  }), {
    isLooping: false,
    speed: 2
  });
  state = "goToNextHole";
  goToNextHoleTicks = 0;
}
function updateGoToNextHole() {
  drawHole();
  color("black");
  text("GO TO NEXT HOLE", 30, 50);
  drawBallAndTime();
  goToNextHoleTicks++;
  if (goToNextHoleTicks > 150 || input.isJustPressed) {
    goToNextHole();
  }
}
var giveUpTicks;
function initGiveUp() {
  state = "giveUp";
  giveUpTicks = 0;
}
function updateGiveUp() {
  drawHole();
  color("black");
  text("GIVE UP", 20, 50);
  giveUpTicks++;
  if (giveUpTicks > 300 || input.isJustPressed) {
    initTitle();
  }
}
var holeOutTicks;
function initHoleOut() {
  state = "holeOut";
  holeOutTicks = 0;
  sss.playMml(sss.generateMml({
    seed: 9,
    noteLength: 16,
    partCount: 2,
    drumPartRatio: 0
  }), {
    isLooping: false,
    speed: 2
  });
}
function updateHoleOut() {
  drawHole();
  color("black");
  text("HOLE OUT!", 70, 50);
  drawBallAndTime();
  holeOutTicks++;
  if (holeOutTicks > 600 || input.isJustPressed) {
    initTitle();
  }
}
var Random = function () {
  function Random() {
    var seed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    _classCallCheck(this, Random);
    this.setSeed(seed);
  }
  return _createClass(Random, [{
    key: "get",
    value: function get() {
      var lowOrHigh = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var high = arguments.length > 1 ? arguments[1] : undefined;
      if (high == null) {
        high = lowOrHigh;
        lowOrHigh = 0;
      }
      return this.next() / 0xffffffff * (high - lowOrHigh) + lowOrHigh;
    }
  }, {
    key: "getInt",
    value: function getInt(lowOrHigh, high) {
      if (high == null) {
        high = lowOrHigh;
        lowOrHigh = 0;
      }
      var lowOrHighInt = Math.floor(lowOrHigh);
      var highInt = Math.floor(high);
      if (highInt === lowOrHighInt) {
        return lowOrHighInt;
      }
      return this.next() % (highInt - lowOrHighInt) + lowOrHighInt;
    }
  }, {
    key: "setSeed",
    value: function setSeed(w) {
      var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 123456789;
      var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 362436069;
      var z = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 521288629;
      var loopCount = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 32;
      this.w = w != null ? w >>> 0 : Math.floor(Math.random() * 0xffffffff) >>> 0;
      this.x = x >>> 0;
      this.y = y >>> 0;
      this.z = z >>> 0;
      for (var i = 0; i < loopCount; i++) {
        this.next();
      }
      return this;
    }
  }, {
    key: "next",
    value: function next() {
      var t = this.x ^ this.x << 11;
      this.x = this.y;
      this.y = this.z;
      this.z = this.w;
      this.w = (this.w ^ this.w >>> 19 ^ (t ^ t >>> 8)) >>> 0;
      return this.w;
    }
  }]);
}();
var random = new Random();
function createHole(seed) {
  random.setSeed(seed);
  platforms = [];
  var pc = random.getInt(1, 3);
  var y = 90;
  var w = 25;
  if (random.get() < 0.5) {
    w = random.getInt(12, 20);
    if (random.get() < 0.5) {
      y = random.getInt(30, 70);
    }
  }
  ball.pos.y = y - 7;
  addPlatform(vec(0, y), w, false, true);
  times(pc, function (i) {
    var w = random.getInt(9, 20);
    addPlatform(vec(random.getInt(150 - w * 6), random.getInt(30, 70)), w, i === pc - 1, false);
  });
}
function addPlatform(pos, width, hasHole, hasTeeing) {
  var grounds = times(width, function () {
    return {
      type: "fairway"
    };
  });
  addGround(grounds, "tree");
  if (random.get() < 0.7) {
    addGround(grounds, "fairway");
  }
  if (random.get() < 0.8) {
    addGround(grounds, "sand");
  }
  if (random.get() < 0.5) {
    addGround(grounds, "water");
  }
  if (hasHole) {
    addGround(grounds, "hole");
  }
  if (hasTeeing) {
    times(5, function (i) {
      grounds[i] = {
        type: "fairway"
      };
    });
  }
  platforms.push({
    pos: pos,
    grounds: grounds
  });
}
function addGround(grounds, type) {
  var w = type === "hole" ? random.getInt(3, 6) : random.getInt(3, grounds.length / 2);
  var x = type === "hole" ? grounds.length - w - random.getInt(3) : random.getInt(grounds.length - w);
  var bh = random.getInt(10, 20);
  times(w, function (i) {
    var height = type === "tree" ? floor(bh + random.getInt(-5, 6)) : undefined;
    if (type === "hole") {
      grounds[x + i] = {
        type: x + i === floor(x + w / 2) ? "flag" : "fairway"
      };
    } else {
      grounds[x + i] = {
        type: type,
        height: height
      };
    }
  });
}
function drawTime(time, x, y) {
  var t = Math.floor(time * 100 / 50);
  if (t >= 10 * 60 * 100) {
    t = 10 * 60 * 100 - 1;
  }
  var ts = getPaddedNumber(Math.floor(t / 6000), 1) + "'" + getPaddedNumber(Math.floor(t % 6000 / 100), 2) + '"' + getPaddedNumber(Math.floor(t % 100), 2);
  text(ts, x, y);
}
function getPaddedNumber(v, digit) {
  return ("0000" + v).slice(-digit);
}

