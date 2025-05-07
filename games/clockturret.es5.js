title = "CLOCK TURRET";
description = "\n[Hold]\n Stop and Shoot\n";
characters = [];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 1
};
var hand;
var shots;
var enemies;
var nextEnemyTicks;
var nextBulletTicks;
var bullets;
var coins;
var multiplier;
function update() {
  if (!ticks) {
    hand = {
      angle: -PI / 2,
      angleVel: 1,
      shootTicks: 0
    };
    shots = [];
    enemies = [];
    nextEnemyTicks = 0;
    bullets = [];
    nextBulletTicks = 0;
    coins = [];
    multiplier = 1;
  }
  color("light_black");
  var lp = vec();
  times(12, function (i) {
    lp.set(50, 50).addWithAngle(-PI / 2 + (i + 1) * PI * 2 / 12, 25).sub(i >= 9 ? 3 : 0, 0);
    text("".concat(i + 1), lp);
  });
  color("blue");
  remove(shots, function (s) {
    s.pos.addWithAngle(s.angle, sqrt(difficulty) * 3);
    bar(s.pos, 4, 2, s.angle);
    return !s.pos.isInRect(-5, -5, 110, 110);
  });
  color("black");
  if (input.isJustPressed) {
    play("select");
    hand.angleVel *= -1;
  }
  if (input.isPressed) {
    hand.shootTicks += difficulty;
    if (hand.shootTicks > 7) {
      play("hit");
      hand.shootTicks -= 7;
      shots.push({
        pos: vec(50, 50).addWithAngle(hand.angle, 12),
        angle: hand.angle
      });
      shots.push({
        pos: vec(50, 50).addWithAngle(hand.angle, -5),
        angle: hand.angle + PI
      });
    }
  } else {
    hand.angle += difficulty * hand.angleVel * 0.1;
  }
  bar(50, 50, 20, 3, hand.angle, 0.2);
  color("blue");
  box(50, 50, 5);
  nextBulletTicks -= difficulty;
  if (nextBulletTicks < 0) {
    if (enemies.length > 0) {
      var e = enemies[rndi(enemies.length)];
      var fp = vec(e.pos).addWithAngle(e.angle, e.speed * 45 / difficulty);
      var oa = wrap(fp.angleTo(50, 50) - e.angleToCenter, -PI, PI);
      if (fp.isInRect(5, 5, 90, 90) && abs(oa) > PI * 0.07) {
        e.bulletTicks = 45;
        nextBulletTicks = rnd(45, 60);
      }
    }
  }
  color("yellow");
  remove(coins, function (c) {
    c.pos.addWithAngle(c.angle, difficulty);
    if (box(c.pos, 6).isColliding.rect.black) {
      play("coin");
      multiplier++;
      return true;
    }
    return !c.pos.isInRect(-5, -5, 110, 110);
  });
  nextEnemyTicks -= difficulty;
  if (nextEnemyTicks < 0) {
    var angle = rnd(PI * 2);
    var angleToCenter = angle + PI / 2 * (rndi(2) * 2 - 1);
    var d = rnd(30, 40);
    var pos = vec(50, 50).addWithAngle(angleToCenter, -d).addWithAngle(angle + PI, 60);
    enemies.push({
      pos: pos,
      angle: angle,
      angleToCenter: angleToCenter,
      speed: rnd(1, difficulty) * 0.5,
      bulletTicks: 0,
      wasInScreen: false
    });
    nextEnemyTicks = rnd(50, 90);
  }
  remove(enemies, function (e) {
    e.pos.addWithAngle(e.angle, e.speed);
    if (e.bulletTicks > 0) {
      var _oa = wrap(e.pos.angleTo(50, 50) - e.angleToCenter, -PI, PI);
      e.bulletTicks -= difficulty;
      color("light_red");
      var w = e.bulletTicks / 6 + 1;
      bar(e.pos, 100, w, e.angleToCenter, 0);
      if (e.bulletTicks <= 0) {
        play("laser");
        bullets.push({
          pos: vec(e.pos),
          angle: e.angleToCenter,
          speed: difficulty * 9
        });
      }
    }
    color("purple");
    if (bar(e.pos, 7, 5, e.angleToCenter).isColliding.rect.blue) {
      play("powerUp");
      particle(e.pos);
      addScore(multiplier);
      coins.push({
        pos: e.pos,
        angle: e.angleToCenter
      });
      return true;
    }
    if (!e.wasInScreen && e.pos.isInRect(0, 0, 100, 100)) {
      e.wasInScreen = true;
    }
    if (e.wasInScreen && !e.pos.isInRect(-5, -5, 110, 110)) {
      return true;
    }
  });
  color("red");
  remove(bullets, function (b) {
    b.pos.addWithAngle(b.angle, b.speed);
    if (bar(b.pos, b.speed * 1.2, 4, b.angle).isColliding.rect.black) {
      play("explosion");
      end();
    }
    return !b.pos.isInRect(-5, -5, 110, 110);
  });
  color("black");
  text("x".concat(multiplier), 3, 9);
}

