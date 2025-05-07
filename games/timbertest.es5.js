title = "TIMBER TEST";
description = "\n[Tap] Cut a log\n";
characters = [];
options = {
  isPlayingBgm: true,
  seed: 18
};
var timber;
var cutCount;
var cutIndex;
var pieces;
var saw;
var scoreCountTicks;
var scoreCountIndex;
var turnScore;
var turnIndex;
var isShowingIndicator;
function update() {
  if (!ticks) {
    turnIndex = 0;
    nextTimber();
  }
  color("red");
  rect(timber.x, 20, timber.width, 10);
  saw.x += saw.vx;
  color("black");
  rect(saw.x - 1, 10, 3, input.isJustPressed ? 30 : 7);
  text("1/".concat(cutCount), 5, 35);
  if (scoreCountTicks === 0 && saw.x >= timber.x + timber.width) {
    var size = vec(timber.width, 10);
    pieces.push({
      size: size,
      pos: vec(timber.x + size.x / 2, 20 + 10 / 2),
      targetPos: vec(50, 40 + cutIndex * 15)
    });
    timber.width = 0;
    cutIndex++;
    scoreCountTicks = 1;
  }
  if (scoreCountTicks === 0 && input.isJustPressed) {
    isShowingIndicator = false;
    var cw = saw.x - timber.x;
    if (cw > 0) {
      play("select");
      var _size = vec(cw, 10);
      pieces.push({
        size: _size,
        pos: vec(timber.x + _size.x / 2, 20 + 10 / 2),
        targetPos: vec(50, 40 + cutIndex * 15)
      });
      timber.x = saw.x;
      timber.width -= cw;
      cutIndex++;
    }
  }
  pieces.forEach(function (p) {
    if (p.pos.distanceTo(p.targetPos) < 1) {
      p.pos = p.targetPos;
    } else {
      p.pos.add(vec(p.targetPos).sub(p.pos).mul(0.1));
    }
    color("red");
    box(p.pos, p.size);
  });
  if (scoreCountTicks > 0) {
    scoreCountTicks += difficulty * (pieces.length + 1) * 0.5;
    var c = clamp(floor(scoreCountTicks / 20), 0, Math.max(cutCount, pieces.length));
    times(c, function (i) {
      color("black");
      var y = 40 + i * 15;
      if (i === 0) {
        if (turnScore < 0) {
          color("red");
        }
        text("".concat(turnScore), 80, y);
      } else {
        var pw1 = i - 1 < pieces.length ? pieces[i - 1].size.x : 0;
        var pw2 = i < pieces.length ? pieces[i].size.x : 0;
        var p = pw1 === 0 && pw2 === 0 || i > cutCount ? 100 : floor(abs(pw1 - pw2) / (pw1 + pw2) * 300);
        text("-".concat(p), 74, y);
        if (i === scoreCountIndex) {
          play("hit");
          turnScore -= p;
          scoreCountIndex++;
        }
      }
    });
  }
  if (saw.x > 160) {
    if (turnScore < 0) {
      play("explosion");
      end();
    } else {
      score += turnScore;
      nextTimber();
    }
  }
  color("black");
  if (turnIndex <= 3 && isShowingIndicator) {
    times(cutCount - 1, function (i) {
      text("^", timber.x + timber.width / cutCount * (i + 1), 35);
    });
    text("Cut here!", 32, 38);
  }
}
function nextTimber() {
  play("powerUp");
  var tw = rnd(40, 80);
  timber = {
    x: (100 - tw) / 2 + rnd((100 - tw) / 3),
    width: tw
  };
  cutCount = rndi(2, 5);
  turnScore = (cutCount - 1) * 100;
  cutIndex = 0;
  pieces = [];
  saw = {
    x: -30,
    vx: difficulty / sqrt(cutCount) * 2
  };
  scoreCountTicks = 0;
  scoreCountIndex = 1;
  turnIndex++;
  isShowingIndicator = true;
}

