title = "EMBATTLED";
description = "\n[Tap]  Turn\n[Hold] Defense\n";
characters = ["\nllllll\nll l l\nll l l\nllllll\n l  l\n l  l\n  ", "\nllllll\nll l l\nll l l\nllllll\nll  ll\n  "];
options = {
  theme: "pixel",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 5
};
var tanks;
var nextTankTicks;
var currentSide;
var sideChangeCount;
var bullets;
var player;
var multiplier;
var tankAngleVel = 0.02;
var tankTurretAngleVel = 0.03;
function update() {
  if (!ticks) {
    tanks = [];
    nextTankTicks = 0;
    currentSide = 0;
    sideChangeCount = 0;
    bullets = [];
    player = {
      pos: vec(50, 30),
      vy: 1,
      pressedTicks: 0
    };
    multiplier = 1;
  }
  if (input.isJustPressed || player.pos.y < 3 && player.vy < 0 || player.pos.y > 97 && player.vy > 0) {
    play("select");
    player.vy *= -1;
  }
  var pWall = player.pressedTicks > 10 / sqrt(difficulty);
  if (input.isPressed) {
    player.pressedTicks++;
  } else {
    player.pos.y += player.vy * difficulty * 0.5;
    player.pressedTicks = 0;
  }
  var playerHasWall = player.pressedTicks > 10 / sqrt(difficulty);
  if (!pWall && playerHasWall) {
    play("powerUp");
  }
  color(playerHasWall ? "cyan" : "blue");
  char(addWithCharCode("a", floor(ticks / 20) % 2), player.pos, {
    mirror: {
      x: player.vy
    }
  });
  var hwr = 1;
  if (playerHasWall) {
    box(player.pos.x - 5, player.pos.y, 5, 15);
    box(player.pos.x + 6, player.pos.y, 5, 15);
    hwr *= 2;
  }
  remove(bullets, function (b) {
    b.pos.add(vec(b.vel).mul(hwr));
    color(b.side === 0 ? "red" : "purple");
    var c = bar(b.pos, 3, 3, b.vel.angle).isColliding;
    if (c.rect.cyan) {
      play("hit");
      return true;
    }
    if (c["char"].a || c["char"].b) {
      play("lucky");
      end();
    }
  });
  if (tanks.length === 0) {
    nextTankTicks = 0;
  }
  nextTankTicks -= hwr;
  if (nextTankTicks < 0) {
    var side = currentSide;
    sideChangeCount--;
    if (sideChangeCount <= 0) {
      currentSide = currentSide === 0 ? 1 : 0;
      sideChangeCount = rndi(1, 4);
    }
    var pos = vec(side === 0 ? -5 : 105, rnd(99));
    var angle = pos.angleTo(player.pos);
    var fireInterval = rnd(300, 400) / difficulty;
    tanks.push({
      pos: pos,
      angle: angle,
      speed: rnd(1, difficulty) * 0.02,
      turretAngle: angle,
      targetPos: undefined,
      fireTicks: rnd(fireInterval),
      fireInterval: fireInterval,
      side: side
    });
    nextTankTicks = rnd(60, 80) / difficulty;
  }
  remove(tanks, function (t) {
    var md;
    if (playerHasWall) {
      md = t.pos.distanceTo(player.pos);
      t.targetPos = player.pos;
    } else {
      md = 99;
      t.targetPos = undefined;
    }
    tanks.forEach(function (ot) {
      if (t.side === ot.side) {
        return;
      }
      var d = t.pos.distanceTo(ot.pos);
      if (d < md) {
        md = d;
        t.targetPos = ot.pos;
      }
    });
    if (t.targetPos != null) {
      var ta = t.pos.angleTo(t.targetPos);
      var oa = wrap(ta - t.turretAngle, -PI, PI);
      var tv = tankTurretAngleVel * difficulty * hwr;
      if (abs(oa) < tv) {
        t.turretAngle = ta;
      } else {
        t.turretAngle += oa > 0 ? tv : -tv;
      }
      oa = wrap(ta - t.angle, -PI, PI);
      tv = tankAngleVel * difficulty;
      if (abs(oa) < tv) {
        t.angle = ta;
      } else {
        t.angle += oa > 0 ? tv : -tv;
      }
    }
    t.pos.addWithAngle(t.angle, t.speed * hwr);
    t.fireTicks -= hwr;
    if (t.fireTicks < 0) {
      play("laser");
      bullets.push({
        pos: vec(t.pos),
        vel: vec().addWithAngle(t.turretAngle, difficulty * 0.5),
        side: t.side
      });
      t.fireTicks = t.fireInterval;
    }
    color(t.side === 0 ? "light_red" : "light_purple");
    var c = bar(t.pos, 1, 6, t.angle).isColliding;
    if (c.rect[t.side === 0 ? "purple" : "red"]) {
      play("explosion");
      color("black");
      particle(t.pos);
      addScore(multiplier, t.pos);
      multiplier++;
      return true;
    }
    if (c["char"].a || c["char"].b) {
      play("lucky");
      end();
    }
    color("black");
    bar(t.pos, 3, 3, t.turretAngle, 0);
    return !t.pos.isInRect(-5, -5, 110, 110);
  });
  color("transparent");
  remove(bullets, function (b) {
    var c = bar(b.pos, 3, 3, b.vel.angle).isColliding.rect;
    if (c[b.side === 0 ? "light_purple" : "light_red"]) {
      return true;
    }
  });
  if (ticks % 60 === 0 && multiplier > 1) {
    multiplier--;
  }
  color("black");
  text("+".concat(multiplier), 3, 9);
}

