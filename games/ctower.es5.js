title = "C TOWER";
description = "\n[Hold] Climb\n";
characters = ["\n  ll\n  l  l\nlllll\n  l\nll ll\n     l\n", "\n  ll\nl l  \n lllll\n  l\n l lll\nl\n"];
options = {
  theme: "crt",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 50
};
var player;
var walls;
var nextWallDist;
var nextBonusCount;
var multiplier;
var radius = 40;
function update() {
  if (!ticks) {
    player = {
      angle: 0,
      height: 0,
      y: 80,
      va: -1,
      tva: -1,
      speed: 3
    };
    walls = [];
    nextWallDist = 0;
    nextBonusCount = 1;
    multiplier = 1;
  }
  if (input.isJustPressed) {
    play("laser");
  }
  player.speed += ((input.isPressed ? 9 : 1) * sqrt(difficulty) - player.speed) * 0.2;
  player.va += (player.tva - player.va) * 0.2;
  if (player.y > 80) {
    player.y -= 0.01;
  }
  player.angle += player.va * sqrt(difficulty) * 0.05;
  var scr = player.speed * 0.3;
  player.height += scr;
  nextWallDist -= scr;
  if (nextWallDist < 0) {
    var isBonus = false;
    nextBonusCount--;
    if (nextBonusCount < 0) {
      isBonus = true;
      nextBonusCount = rnd(9, 12);
    }
    walls.push({
      angle: rnd(PI * 2),
      width: rnd(0.5, 1) * PI / 2,
      y: -5,
      isFloating: isBonus || rnd() < 0.3,
      isBonus: isBonus
    });
    nextWallDist += rnd(30, 40);
  }
  walls.forEach(function (w) {
    w.y += scr;
    var wa = player.angle - w.angle;
    var fa = clamp(wrap(wa - w.width / 2, 0, PI * 2), PI / 2, PI / 2 * 3);
    var ta = clamp(wrap(wa + w.width / 2, 0, PI * 2), PI / 2, PI / 2 * 3);
    if (fa < ta) {
      var fx = sin(fa) * radius * (w.isFloating ? 1.2 : 1.1);
      var tx = sin(ta) * radius * (w.isFloating ? 1.2 : 1.1);
      color(w.isBonus ? "yellow" : "purple");
      rect(fx + 50, w.y, tx - fx, -5);
    }
  });
  var ho = player.height % 400 - 100;
  color("cyan");
  rect(50 - radius, ho, radius * 2, -100);
  rect(50 - radius, (ho + 200) % 400, radius * 2, -100);
  color("light_cyan");
  rect(50 - radius, (ho + 100) % 400, radius * 2, -100);
  rect(50 - radius, (ho + 300) % 400, radius * 2, -100);
  color("white");
  var a = wrap(player.angle, -PI, PI);
  if (a > -PI / 2 && a < PI / 2) {
    rect(50 + sin(a) * radius, ho, 1, -100);
  }
  a = wrap(player.angle + PI / 2, -PI, PI);
  if (a > -PI / 2 && a < PI / 2) {
    rect(50 + sin(a) * radius, (ho + 100) % 400, 1, -100);
  }
  a = wrap(player.angle + PI, -PI, PI);
  if (a > -PI / 2 && a < PI / 2) {
    rect(50 + sin(a) * radius, (ho + 200) % 400, 1, -100);
  }
  a = wrap(player.angle + PI / 2 * 3, -PI, PI);
  if (a > -PI / 2 && a < PI / 2) {
    rect(50 + sin(a) * radius, (ho + 300) % 400, 1, -100);
  }
  walls.forEach(function (w) {
    if (w.isFloating) {
      var wa = player.angle - w.angle;
      var fa = clamp(wrap(wa - w.width / 2, -PI, PI), -PI / 2, PI / 2);
      var ta = clamp(wrap(wa + w.width / 2, -PI, PI), -PI / 2, PI / 2);
      if (fa < ta) {
        var fx = sin(fa) * radius * 1.2;
        var tx = sin(ta) * radius * 1.2;
        color(w.isBonus ? "light_yellow" : "light_purple");
        var cfx = clamp(fx + 53, 50 - radius, 50 + radius);
        var ctx = clamp(tx + 53, 50 - radius, 50 + radius);
        rect(cfx, w.y + (w.isFloating ? 6 : 2), ctx - cfx, -5);
      }
    }
  });
  color("black");
  char(addWithCharCode("a", floor(player.height / 9) % 2), 50 + 30 * player.va, player.y, {
    mirror: {
      x: player.va < 0 ? 1 : -1
    }
  });
  if (player.y > 97) {
    play("explosion");
    end();
  }
  remove(walls, function (w) {
    var wa = player.angle - w.angle;
    var fa = clamp(wrap(wa - w.width / 2, -PI, PI), -PI / 2, PI / 2);
    var ta = clamp(wrap(wa + w.width / 2, -PI, PI), -PI / 2, PI / 2);
    if (fa < ta) {
      var fx = sin(fa) * radius * (w.isFloating ? 1.2 : 1.1);
      var tx = sin(ta) * radius * (w.isFloating ? 1.2 : 1.1);
      if (!w.isFloating) {
        color("light_purple");
        var cfx = clamp(fx + 51, 50 - radius, 50 + radius);
        var ctx = clamp(tx + 51, 50 - radius, 50 + radius);
        rect(cfx, w.y + 2, ctx - cfx, -5);
      }
      color(w.isBonus ? "yellow" : "purple");
      var c = rect(fx + 50, w.y, tx - fx, -5).isColliding["char"];
      if (c.a || c.b) {
        if (w.isBonus) {
          play("powerUp");
          multiplier++;
          w.isBonus = false;
        } else if (!w.isFloating) {
          play("coin");
          player.angle = player.tva > 0 ? w.angle - w.width / 2 - 0.7 : w.angle + w.width / 2 + 0.7;
          player.tva *= -1;
          player.y = clamp(w.y + 6, 0, 99);
        }
      }
    }
    return w.y > 105;
  });
  color("black");
  text("x".concat(multiplier), 3, 9);
  addScore(scr * multiplier);
}

