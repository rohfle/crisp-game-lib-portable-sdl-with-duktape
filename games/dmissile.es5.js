title = "D MISSILE";
description = "\n[Tap]  Launch\n[Hold] Turn\n";
characters = [];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 9
};
var enemies;
var nextEnemyTicks;
var enemyId;
var players;
var tapTicks;
var multiplier;
var initAngle = -PI / 9 * 8;
var initPos = vec(60, 90);
function update() {
  if (!ticks) {
    enemies = [];
    nextEnemyTicks = 0;
    enemyId = 0;
    players = [];
    tapTicks = 0;
    multiplier = 1;
  }
  if (input.isJustPressed) {
    play("select");
    tapTicks = players.length === 0 ? 99 : players.length >= 3 ? 0 : 9;
  }
  tapTicks--;
  if (input.isJustReleased && tapTicks > 0) {
    play("coin");
    players.push({
      pos: vec(initPos),
      angle: initAngle,
      speed: 0.5 * sqrt(difficulty)
    });
    multiplier *= 0.9;
    if (multiplier < 1) {
      multiplier = 1;
    }
  }
  remove(players, function (p) {
    p.pos.addWithAngle(p.angle, p.speed);
    p.speed *= 1.002;
    if (input.isPressed) {
      p.angle += p.speed * (p.speed < 3 * sqrt(difficulty) ? 0.1 : 0.01);
    }
    color("purple");
    box(vec(p.pos).addWithAngle(p.angle, -3), 5);
    color("blue");
    bar(p.pos, 3, 3, p.angle);
    return !p.pos.isInRect(-3, -3, 106, 93);
  });
  if (players.length < 3) {
    color("blue");
    bar(initPos, 3, 3, initAngle);
  }
  color("light_black");
  rect(0, 90, 100, 10);
  if (enemies.length === 0) {
    nextEnemyTicks = 0;
  }
  nextEnemyTicks--;
  if (nextEnemyTicks < 0) {
    var c = rndi(3, 6);
    times(c, function () {
      var pos = vec(rnd(10, 90), -rnd(5, 25));
      var vel = vec(rnd(1, sqrt(difficulty)) * 0.1).rotate(pos.angleTo(rnd(10, 90), 90));
      var ticks = rnd() < sqrt(difficulty) ? ceil(rnd(300, 400) / sqrt(difficulty)) : 999;
      enemies.push({
        pos: pos,
        vel: vel,
        from: vec(pos),
        ticks: ticks,
        id: enemyId,
        isRemoving: false
      });
      enemyId++;
    });
    nextEnemyTicks = 150 / sqrt(difficulty) * c;
  }
  remove(enemies, function (e) {
    if (e.isRemoving) {
      return true;
    }
    if (e.ticks > 0) {
      e.pos.add(e.vel);
      e.ticks--;
      if (e.ticks === 0) {
        play("hit");
        var _c = rndi(2, 5);
        times(_c, function (i) {
          var pos = vec(e.pos);
          var vel = vec(e.vel.length).rotate(pos.angleTo(rnd(10, 90), 90));
          enemies.push({
            pos: pos,
            vel: vel,
            from: vec(pos),
            ticks: 999,
            id: i === 0 ? e.id : enemyId,
            isRemoving: false
          });
          enemyId++;
        });
      }
    }
    color("light_black");
    line(e.from, e.pos, 2);
    if (e.ticks > 0) {
      color("red");
      if (box(e.pos, 4).isColliding.rect.blue) {
        play("powerUp");
        addScore(floor(multiplier), e.pos);
        particle(e.pos);
        multiplier += 1 / clamp(players.length, 1, 99);
        enemies.forEach(function (ae) {
          if (ae.id === e.id) {
            ae.isRemoving = true;
          }
        });
        return true;
      }
    }
    if (e.pos.y > 90) {
      play("explosion");
      end();
    }
  });
  color("black");
  text("x".concat(floor(multiplier)), 3, 9);
}

