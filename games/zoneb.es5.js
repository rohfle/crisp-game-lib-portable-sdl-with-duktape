title = "ZONE B";
description = "\n[Tap]  Turn\n[Hold] Shot\n";
characters = ["\nl\nll\nll\nl\n", "\nllll\n", "\nlll\n", "\nlll\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 15
};
var enemies;
var walls;
var bullets;
var player;
var level;
var isLevelCleared;
var levelClearTicks;
var nextCircleTarget;
var nextCircle;
var circle;
var circleTicks;
var multiplier;
var angleVels = [[1, 0], [0, 1], [-1, 0], [0, -1]];
var shownRange = 30;
function update() {
  if (!ticks) {
    level = 0;
    isLevelCleared = true;
    levelClearTicks = 0;
  }
  if (isLevelCleared) {
    circleTicks = 99;
    circle = {
      pos: vec(50, 50),
      radius: 120
    };
    nextCircle = {
      pos: vec(50, 50),
      radius: 60
    };
    nextCircleTarget = {
      pos: vec(),
      radius: 0
    };
    enemies = times(9 + level * 7, function () {
      return {
        pos: vec(rnd(99), rnd(99)),
        angle: rndi(4),
        speed: 0,
        shotTicks: rnd(200, 300),
        burstTicks: 0,
        burstCount: 0,
        turnTicks: 0,
        isReflecting: false
      };
    });
    walls = times(19, function () {
      return {
        pos: vec(rnd(9, 89), rnd(9, 89)),
        width: rnd(5, 15),
        angle: rndi(2)
      };
    });
    bullets = [];
    player = {
      pos: vec(50, 80),
      angle: 3,
      speed: 0,
      isReflecting: false,
      shotTicks: 0
    };
    level++;
    isLevelCleared = false;
    multiplier = 1;
  }
  circleTicks--;
  if (circleTicks === 9) {
    nextCircleTarget.radius = nextCircle.radius - 10;
    nextCircleTarget.pos.set(nextCircle.pos);
    for (var i = 0; i < 99; i++) {
      nextCircleTarget.pos.set(rnd(10, 90), rnd(10, 90));
      if (nextCircleTarget.pos.distanceTo(nextCircle.pos) < nextCircle.radius - nextCircleTarget.radius) {
        break;
      }
    }
  }
  if (circleTicks < 0) {
    circleTicks = 600;
  }
  if (circleTicks < 9) {
    nextCircle.pos.add((nextCircleTarget.pos.x - nextCircle.pos.x) / (circleTicks + 1), (nextCircleTarget.pos.y - nextCircle.pos.y) / (circleTicks + 1));
    nextCircle.radius += (nextCircleTarget.radius - nextCircle.radius) / (circleTicks + 1);
  }
  if (nextCircle.radius < 60) {
    color("light_black");
    arc(nextCircle.pos, nextCircle.radius, 2);
    if (circleTicks > 9) {
      circle.pos.add((nextCircle.pos.x - circle.pos.x) / circleTicks, (nextCircle.pos.y - circle.pos.y) / circleTicks);
      circle.radius += (nextCircle.radius - circle.radius) / circleTicks;
    }
    color("blue");
    arc(circle.pos, circle.radius, 3);
  }
  color("yellow");
  remove(walls, function (w) {
    var c;
    if (w.angle === 0) {
      c = box(w.pos, w.width, 2);
    } else {
      c = box(w.pos, 2, w.width);
    }
    return c.isColliding.rect.blue;
  });
  remove(bullets, function (b) {
    var av = angleVels[b.angle];
    b.pos.add(av[0], av[1]);
    var isShown = b.side === "player" || b.pos.distanceTo(player.pos) < shownRange;
    color(isShown ? b.side === "enemy" ? "purple" : "cyan" : "transparent");
    if (char(b.side === "enemy" ? "c" : "d", b.pos, {
      rotation: b.angle
    }).isColliding.rect.yellow || !b.pos.isInRect(0, 0, 99, 99)) {
      return true;
    }
    b.range--;
    return b.range < 0;
  });
  remove(enemies, function (e) {
    var av = angleVels[e.angle];
    e.pos.add(av[0] * e.speed, av[1] * e.speed);
    var isShown = e.pos.distanceTo(player.pos) < shownRange;
    if (isShown) {
      color("black");
      char("b", e.pos.x + av[0] * 2, e.pos.y + av[1] * 2, {
        rotation: e.angle
      });
    }
    color(isShown ? "red" : "transparent");
    var c = char("a", e.pos, {
      rotation: e.angle
    }).isColliding;
    if (c["char"].d) {
      play("explosion");
      addScore(multiplier, e.pos);
      multiplier++;
      return true;
    }
    if (c.rect.yellow || !e.pos.isInRect(0, 0, 99, 99)) {
      if (!e.isReflecting) {
        e.angle += 2;
        e.isReflecting = true;
      }
    } else {
      e.isReflecting = false;
    }
    if (e.shotTicks > 7) {
      e.turnTicks--;
    }
    if (e.turnTicks < 0) {
      e.angle++;
      e.turnTicks = rnd(200, 300);
    }
    e.angle = wrap(e.angle, 0, 4);
    e.shotTicks--;
    if (e.shotTicks < 0) {
      e.burstCount--;
      if (e.burstCount < 0) {
        e.shotTicks = rnd(100, 200);
        e.burstCount = rndi(3, 7);
      } else {
        bullets.push({
          pos: vec(e.pos.x + av[0] * 5, e.pos.y + av[1] * 5),
          angle: e.angle,
          range: 20,
          side: "enemy"
        });
        e.shotTicks += 7;
      }
    }
    e.speed += ((e.shotTicks < 7 ? 0 : 0.2) - e.speed) * 0.1;
    checkCircleReflect(e);
    e.pos.clamp(0, 99, 0, 99);
  });
  var av = angleVels[player.angle];
  player.speed += ((input.isPressed ? 0 : 0.2) - player.speed) * 0.1;
  if (input.isJustReleased) {
    if (player.speed > 0.04) {
      play("laser");
      player.angle = wrap(player.angle + 1, 0, 4);
    }
  }
  player.shotTicks--;
  if (input.isPressed && player.speed < 0.04) {
    if (player.shotTicks < 0) {
      play("hit");
      bullets.push({
        pos: vec(player.pos.x + av[0] * 5, player.pos.y + av[1] * 5),
        angle: player.angle,
        range: 20,
        side: "player"
      });
      player.shotTicks = 7;
    }
  }
  player.pos.add(av[0] * player.speed, av[1] * player.speed);
  checkCircleReflect(player);
  color("black");
  char("b", player.pos.x + av[0] * 2, player.pos.y + av[1] * 2, {
    rotation: player.angle
  });
  color("blue");
  var c = char("a", player.pos, {
    rotation: player.angle
  }).isColliding;
  if (c["char"].c || circle.radius < 1 || player.pos.distanceTo(circle.pos) > circle.radius * 1.05) {
    play("lucky");
    end();
  }
  player.pos.clamp(0, 99, 0, 99);
  if (c.rect.yellow || !player.pos.isInRect(0, 0, 99, 99)) {
    if (!player.isReflecting) {
      player.angle += 2;
      player.isReflecting = true;
    }
  } else {
    player.isReflecting = false;
  }
  player.angle = wrap(player.angle, 0, 4);
  if (levelClearTicks <= -60 && enemies.length === 0) {
    play("powerUp");
    levelClearTicks = 60;
  }
  if (levelClearTicks > 0) {
    color("black");
    text("WINNER!", 30, 50);
    levelClearTicks--;
    if (levelClearTicks === 0) {
      isLevelCleared = true;
    }
  } else if (levelClearTicks > -60) {
    color("black");
    text("LEVEL ".concat(level), 30, 50);
    levelClearTicks--;
  }
  function checkCircleReflect(o) {
    if (o.pos.distanceTo(circle.pos) < circle.radius) {
      return;
    }
    var a = o.pos.angleTo(circle.pos);
    if (a < -PI / 4 * 3 || a > PI / 4 * 3) {
      o.angle = 2;
    } else if (a > PI / 4) {
      o.angle = 1;
    } else if (a < -PI / 4) {
      o.angle = 3;
    } else {
      o.angle = 0;
    }
  }
}

