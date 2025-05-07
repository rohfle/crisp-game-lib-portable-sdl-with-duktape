title = "TROJAN DEFENSE";
description = "\n[Tap]\n Change Direction\n[Hold]\n Extend Shield\n";
characters = ["\n   ll\n   l\n lLll\nllllll\nl    l\nl    l\n", "\n   ll\n   l\n lLll\nllllll\nl    l\nl  l\n", "\n   r\n  rrr\n rrrrr\nrrrrrrr\n rrrrr\n  rrr\n   r\n", "\n  ll\n llll\nllllll\nllllll\n llll\n  ll\n"];
options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 7
};
var horse;
var shield;
var enemies;
var projectiles;
var explosions;
var multiplier;
var waveCount;
var nextEnemyTicks;
function update() {
  if (!ticks) {
    horse = {
      pos: vec(50, 50),
      radius: 5
    };
    shield = {
      angle: 0,
      length: 10,
      width: 4,
      arcAngle: PI / 8,
      rotationSpeed: 0.06,
      rotationDirection: 1,
      extending: false
    };
    enemies = [];
    projectiles = [];
    explosions = [];
    multiplier = 1;
    waveCount = 0;
    nextEnemyTicks = 60;
  }
  color("light_black");
  arc(horse.pos, 60, 2);
  if (input.isJustPressed) {
    play("select");
    shield.rotationDirection *= -1;
    multiplier = 1;
  }
  if (input.isPressed) {
    shield.extending = true;
    if (shield.arcAngle < PI / 3) {
      shield.arcAngle += 0.02;
    }
    if (shield.length < 20) {
      shield.length += 0.5;
    }
  } else {
    shield.extending = false;
    if (shield.arcAngle > PI / 8) {
      shield.arcAngle -= 0.015;
    }
    if (shield.length > 10) {
      shield.length -= 0.3;
    }
  }
  var speedFactor;
  if (shield.extending) {
    speedFactor = 1 - (shield.arcAngle - PI / 8) / (PI / 3 - PI / 8) * 0.7;
  } else {
    speedFactor = 1.2;
  }
  shield.angle += shield.rotationDirection * shield.rotationSpeed * speedFactor * difficulty;
  color("black");
  char(shield.extending ? "b" : "a", horse.pos);
  color("cyan");
  var shieldStartAngle = shield.angle - shield.arcAngle / 2;
  var shieldEndAngle = shield.angle + shield.arcAngle / 2;
  for (var r = horse.radius; r <= horse.radius + shield.length; r += 1.5) {
    arc(horse.pos, r, 1, shieldStartAngle, shieldEndAngle);
  }
  nextEnemyTicks--;
  if (nextEnemyTicks < 0) {
    waveCount++;
    var enemyCount = Math.min(5, Math.floor(1 + waveCount / 3));
    var baseAngle = rnd(0, Math.PI * 2);
    for (var i = 0; i < enemyCount; i++) {
      var angleVariation = rnd(-PI / 4, PI / 4);
      var angle = baseAngle + angleVariation;
      var distance = 50;
      var enemyPos = vec(horse.pos.x + Math.cos(angle) * distance, horse.pos.y + Math.sin(angle) * distance);
      var enemyType = rnd() < 0.7 ? 0 : rnd() < 0.5 ? 1 : 2;
      var fireRate = void 0,
        fireSpeed = void 0;
      switch (enemyType) {
        case 0:
          fireRate = rnd(120, 180) / sqrt(difficulty);
          fireSpeed = 0.5 * sqrt(difficulty);
          break;
        case 1:
          fireRate = rnd(80, 120) / sqrt(difficulty);
          fireSpeed = 0.8 * sqrt(difficulty);
          break;
        case 2:
          fireRate = rnd(150, 200) / sqrt(difficulty);
          fireSpeed = 0.4 * sqrt(difficulty);
          break;
      }
      enemies.push({
        pos: enemyPos,
        type: enemyType.toString(),
        fireRate: fireRate,
        nextFire: rnd(30, 60),
        fireSpeed: fireSpeed
      });
    }
    nextEnemyTicks = rnd(180, 300) / sqrt(difficulty);
  }
  color("light_red");
  remove(explosions, function (e) {
    e.ticks--;
    var radiusRatio = e.ticks / e.duration;
    var r = e.radius * sin(radiusRatio * PI);
    arc(e.pos, r);
    return e.ticks < 0;
  });
  remove(projectiles, function (p) {
    p.pos.add(p.vel);
    color("red");
    var projectileCollision = box(p.pos, 3).isColliding;
    if (p.isDeflected) {
      color("yellow");
      box(p.pos, 2.5);
    }
    if (!p.isDeflected) {
      if (projectileCollision.rect.cyan) {
        p.isDeflected = true;
        p.deflectedTicks = 0;
        play("coin");
        var angleToProjectile = horse.pos.angleTo(p.pos);
        var reflectionAngle = angleToProjectile;
        var speed = p.vel.length * 1.5;
        p.vel = vec(speed, 0).rotate(reflectionAngle);
        particle(p.pos, 5, 1, reflectionAngle, PI / 4);
        return false;
      }
      if (projectileCollision["char"].a || projectileCollision["char"].b) {
        play("explosion");
        end();
        return true;
      }
    } else {
      p.deflectedTicks++;
      if (projectileCollision["char"].c || projectileCollision["char"].d || projectileCollision["char"].e) {
        return true;
      }
    }
    var distanceFromCenter = p.pos.distanceTo(horse.pos);
    return distanceFromCenter > 55;
  });
  remove(enemies, function (e) {
    color("red");
    var enemyCollision = char(addWithCharCode("c", parseInt(e.type)), e.pos).isColliding;
    var isHit = enemyCollision.rect.yellow;
    if (isHit) {
      play("powerUp");
      addScore(multiplier * (parseInt(e.type) + 1) * 10, e.pos);
      multiplier++;
      explosions.push({
        pos: vec(e.pos),
        radius: 8,
        duration: 20,
        ticks: 20
      });
      particle(e.pos, 15, 2, 0, PI * 2);
      return true;
    }
    e.nextFire--;
    if (e.nextFire <= 0) {
      var _angle = e.pos.angleTo(horse.pos);
      projectiles.push({
        pos: vec(e.pos),
        vel: vec(e.fireSpeed, 0).rotate(_angle),
        isDeflected: false,
        deflectedTicks: 0
      });
      play("laser");
      e.nextFire = e.fireRate * rnd(0.8, 1.2);
    }
    return false;
  });
  if (multiplier > 1) {
    color("yellow");
    text("x" + multiplier, 3, 9, {
      scale: 1,
      isSmallText: true
    });
  }
  if (enemies.length === 0 && ticks > 100) {
    difficulty += 0.0005;
  }
}

