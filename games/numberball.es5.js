title = "NUMBER BALL";
description = "\n[Hold]    Set angle\n[Release] Hit a shot\n";
characters = [];
options = {
  viewSize: {
    x: 200,
    y: 60
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 8
};
var balls;
var isAddingNextBall;
var floors;
var multiplier;
var scrV;
var scrVB;
function update() {
  if (!ticks) {
    balls = [];
    isAddingNextBall = true;
    floors = [{
      value: undefined,
      x: 0,
      width: 200
    }];
    multiplier = 1;
    scrV = scrVB = 0;
  }
  var lf = floors[0];
  var lx = lf.x + lf.width;
  var scr = sqrt(difficulty) * 0.04 + scrV;
  scrV *= 0.9;
  scrVB = clamp(scrVB - 0.01, 0, 9);
  if (lx > 100) {
    scr += (lx - 100) * 0.1;
  }
  var ballMaxValue = clamp(difficulty * 2, 1, 9);
  var rx = 0;
  remove(floors, function (f, i) {
    f.x -= scr;
    color(i == 0 ? "light_red" : "light_green");
    rect(f.x, 50, f.width - 2, 10);
    rx = f.x + f.width;
    if (f.value != null) {
      color("red");
      text("".concat(f.value), f.x + 7, 55);
      var isRemoving = false;
      balls.forEach(function (b) {
        if (b.state === "onFloor" && b.pos.x > f.x - 3 && b.pos.x < rx + 3 && f.value === b.value) {
          isRemoving = true;
        }
      });
      if (isRemoving) {
        play("coin");
        addScore(f.value * multiplier, f.x + 7, 50);
        if (multiplier < 16) {
          multiplier *= 2;
        }
        return true;
      }
    }
    if (i < floors.length - 1) {
      var rf = floors[i + 1];
      if (rx < rf.x + 2) {
        f.x += (rf.x - rx) * 0.1;
      } else {
        f.x = rf.x - f.width;
      }
    }
  });
  color("green");
  rect(0, 50, 20, 10);
  color("white");
  rect(20, 50, 13, 10);
  if (floors[0].x + floors[0].width < 30) {
    color("red");
    text("X", 33, 55);
    play("explosion");
    end();
  }
  if (rx < 200) {
    play("hit");
    floors.push({
      value: rndi(floor(ballMaxValue)) + 1,
      x: 200,
      width: rnd(20, 50)
    });
  }
  if (ticks > 30 && isAddingNextBall) {
    var value;
    var _loop = function _loop() {
      value = rndi(floor(ballMaxValue)) + 1;
      var isMatched = false;
      floors.forEach(function (f) {
        if (f.value === value) {
          isMatched = true;
        }
      });
      if (isMatched) {
        return 1;
      }
    };
    for (var i = 0; i < 9; i++) {
      if (_loop()) break;
    }
    play("laser");
    balls.push({
      value: value,
      pos: vec(10, 47),
      vel: vec(1, 0).rotate(-0.1),
      state: "stay"
    });
    isAddingNextBall = false;
  }
  remove(balls, function (b) {
    if (b.state === "removing") {
      return true;
    }
    if (b.state === "stay") {
      if (input.isJustPressed) {
        play("select");
      }
      if (input.isPressed) {
        b.vel.rotate(-0.01 * difficulty);
        color("black");
        line(vec(b.vel).mul(3).add(b.pos), vec(b.vel).mul(15).add(b.pos), 2);
      }
      if (input.isJustReleased || b.vel.angle < -PI * 0.47) {
        play("powerUp");
        if (multiplier > 1) {
          multiplier /= 2;
        }
        scrV = scrVB;
        scrVB++;
        b.vel.mul(5);
        b.state = "flying";
      }
    } else if (b.state === "flying") {
      b.vel.y += 0.1;
      b.vel.mul(0.99);
      b.pos.add(b.vel);
      if (b.pos.y > 47) {
        b.vel.y *= -0.5;
        b.vel.x *= 0.5;
        b.pos.y = 47;
        if (abs(b.vel.y) < 0.5) {
          b.state = "onFloor";
          isAddingNextBall = true;
        }
      }
    } else if (b.state === "onFloor") {
      b.vel.x *= 0.9;
      b.pos.x += b.vel.x;
      b.vel.y = 0;
      if (b.pos.x < 30) {
        b.state = "falling";
      }
    } else if (b.state === "falling") {
      b.vel.y += 0.1;
      b.pos.y += b.vel.y;
      if (b.pos.y > 63) {
        return true;
      }
    }
    if (b.state !== "stay" && b.state !== "falling") {
      b.pos.x -= scr;
      balls.forEach(function (ob) {
        if (ob === b) {
          return;
        }
        if (ob.pos.distanceTo(b.pos) < 6) {
          b.vel.addWithAngle(ob.pos.angleTo(b.pos), ob.vel.length * 0.7);
          ob.vel.addWithAngle(b.pos.angleTo(ob.pos), b.vel.length * 0.7);
        }
      });
    }
    color("blue");
    text("".concat(b.value), b.pos);
    if (b.pos.x > 220 || b.pos.x < -20 || b.pos.y < -50) {
      if (b.state === "flying") {
        isAddingNextBall = true;
      }
      return true;
    }
  });
  color("black");
  text("x".concat(multiplier), 3, 10);
}

