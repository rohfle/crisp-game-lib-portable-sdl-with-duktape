title = "IN TOW";
description = "\n[Tap] Multiple jumps\n";
characters = ["\n bbbb\nbbblwb\nbbbbyy\n  bb\nbbbb\n  y y\n", "\n bbbb\nbbblwb\nbbbbyy\nbbbb\n bbb\n y y\n", "\n\n\n yy\n yyl\nyyyy\n yy\n y\n", "\n rrr l\nrrrr l\nrrrr l\nrrrr l\nrrrr l\n rrr l\n"];
options = {
  viewSize: {
    x: 200,
    y: 100
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 50
};
var bird;
var chicks;
var fallingChicks;
var floors;
var nextFloorDist;
var bullets;
var nextBulletDist;
var isFalling;
function update() {
  if (!ticks) {
    bird = {
      pos: vec(64, 32),
      vy: 0,
      posHistory: [],
      isJumping: true
    };
    chicks = [];
    fallingChicks = [];
    floors = [{
      pos: vec(70, 70),
      width: 90,
      hasChick: false
    }, {
      pos: vec(150, 50),
      width: 90,
      hasChick: true
    }];
    nextFloorDist = 0;
    bullets = [];
    nextBulletDist = 99;
    isFalling = false;
  }
  var scr = sqrt(difficulty);
  if (bird.isJumping) {
    if (chicks.length > 0 && input.isJustPressed) {
      play("jump");
      play("hit");
      bird.vy = -2 * sqrt(difficulty);
      chicks.shift();
      fallingChicks.push({
        pos: vec(bird.posHistory[2]),
        vy: 0
      });
    }
    var pp = vec(bird.pos);
    bird.vy += (input.isPressed ? 0.05 : 0.2) * difficulty;
    bird.pos.y += bird.vy;
    var op = vec(bird.pos).sub(pp).div(9);
    color("white");
    times(9, function () {
      pp.add(op);
      box(pp, 6);
    });
  } else {
    if (input.isJustPressed) {
      play("jump");
      bird.vy = -2 * sqrt(difficulty);
      bird.isJumping = true;
    }
  }
  color("black");
  char(bird.vy < 0 ? "b" : "a", bird.pos);
  nextFloorDist -= scr;
  if (nextFloorDist < 0) {
    var width = rnd(40, 80);
    floors.push({
      pos: vec(200 + width / 2, rndi(30, 90)),
      width: width,
      hasChick: true
    });
    nextFloorDist += width + rnd(10, 30);
  }
  remove(floors, function (f) {
    f.pos.x -= scr;
    color("light_yellow");
    var c = box(f.pos, f.width, 4).isColliding.rect;
    if (bird.vy > 0 && c.white) {
      bird.pos.y = f.pos.y - 5;
      bird.isJumping = false;
      bird.vy = 0;
    }
    if (f.hasChick) {
      color("black");
      var _c = char("c", f.pos.x, f.pos.y - 5).isColliding["char"];
      if (_c.a || _c.b) {
        if (chicks.length < 30) {
          chicks.push({
            index: 0,
            targetIndex: 0
          });
        }
        play("select");
        addScore(chicks.length, f.pos.x, f.pos.y - 5);
        f.hasChick = false;
      }
    }
    return f.pos.x < -f.width / 2;
  });
  bird.posHistory.forEach(function (p) {
    p.x -= scr;
  });
  bird.posHistory.unshift(vec(bird.pos));
  if (bird.posHistory.length > 99) {
    bird.posHistory.pop();
  }
  color("transparent");
  if (!bird.isJumping) {
    if (!box(bird.pos.x, bird.pos.y + 4, 9, 2).isColliding.rect.light_yellow) {
      bird.isJumping = true;
    }
  }
  nextBulletDist -= scr;
  if (nextBulletDist < 0) {
    bullets.push({
      pos: vec(203, rndi(10, 90)),
      vx: rnd(1, difficulty) * 0.3
    });
    nextBulletDist += rnd(50, 80) / sqrt(difficulty);
  }
  color("black");
  remove(bullets, function (b) {
    b.pos.x -= b.vx + scr;
    var c = char("d", b.pos).isColliding["char"];
    if (c.a || c.b) {
      play("explosion");
      if (chicks.length > 0) {
        isFalling = true;
        bird.vy = 3 * sqrt(difficulty);
      } else {
        end();
      }
      return true;
    }
    return b.pos.x < -3;
  });
  color("black");
  var isHit = isFalling;
  isFalling = false;
  remove(chicks, function (c, i) {
    c.targetIndex = 3 * (i + 1);
    c.index += (c.targetIndex - c.index) * 0.05;
    var p = bird.posHistory[floor(c.index)];
    var cl = char("c", p).isColliding;
    if (cl["char"].d) {
      play("powerUp");
      isHit = true;
    }
    if (isHit) {
      fallingChicks.push({
        pos: vec(p),
        vy: 0
      });
      return true;
    }
  });
  remove(fallingChicks, function (f) {
    f.vy += 0.3 * difficulty;
    f.pos.y += f.vy;
    char("c", f.pos, {
      mirror: {
        y: -1
      }
    });
    return f.pos.y > 103;
  });
  color("black");
  char(bird.vy < 0 ? "b" : "a", bird.pos);
  if (bird.pos.y > 99) {
    play("explosion");
    end();
  }
}

