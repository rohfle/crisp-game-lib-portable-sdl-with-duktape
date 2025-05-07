title = "FOOT LASER";
description = "\n[Tap]\n Jump / Double jump / Descent\n";
characters = ["\nllllll\nll l l\nll l l\nllllll\n l  l\n l  l\n  ", "\nllllll\nll l l\nll l l\nllllll\nll  ll\n  ", "\n  lll\nll l l\n llll\n  ll\n l  l\n l  l\n", "\n  lll\nll l l\n llll\n l  l\nll  ll\n", "\nll\n ll\n ll l\nllllll\n\n\n", "\n\n    l\nllllll\n ll\n ll\nll\n"];
options = {
  viewSize: {
    x: 200,
    y: 100
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 3
};
var floorHeight = 90;
var maxJumpCount = 2;
var player;
var enemies;
var nextEnemyTicks;
var nextWallTicks;
var nextFlyingTicks;
var floorX;
var animTicks;
function update() {
  if (!ticks) {
    player = {
      pos: vec(20, 50),
      vy: 0,
      jumpCount: 9,
      isOnFloor: false,
      multiplier: 1,
      shots: [],
      nextShotTicks: 0
    };
    enemies = [];
    nextEnemyTicks = 0;
    nextWallTicks = rnd(300, 400);
    nextFlyingTicks = rnd(200, 300);
    floorX = 0;
    animTicks = 0;
  }
  var df = sqrt(difficulty);
  animTicks += df;
  color("light_black");
  rect(floorX, floorHeight, 210, 9);
  rect(floorX + 212, floorHeight, 210, 9);
  floorX -= df;
  if (floorX < -209) {
    floorX += 212;
  }
  if (!player.isOnFloor) {
    player.vy += (input.isPressed ? 0.1 : 0.3) * df;
    player.pos.y += player.vy;
    if (player.pos.y > floorHeight) {
      play("hit");
      player.pos.y = floorHeight;
      player.isOnFloor = true;
      player.jumpCount = 0;
      player.multiplier = 1;
    }
    player.nextShotTicks--;
    if (player.nextShotTicks < 0) {
      player.shots.push(vec(player.pos.x + 2, player.pos.y + 9));
      player.nextShotTicks += rnd(4, 9);
    }
  }
  if (input.isJustPressed) {
    if (player.jumpCount === maxJumpCount) {
      play("laser");
      player.vy += 9 * sqrt(df);
    } else if (player.jumpCount < maxJumpCount) {
      play("jump");
      player.vy = -3 * sqrt(df);
      player.isOnFloor = false;
    }
    player.jumpCount++;
  }
  color("black");
  char(addWithCharCode("a", floor(animTicks / 15) % 2), player.pos.x + 3, player.pos.y - 3);
  if (!player.isOnFloor) {
    color("light_blue");
    rect(player.pos.x + 2, player.pos.y, 2, floorHeight - player.pos.y);
  }
  color("purple");
  remove(player.shots, function (s) {
    if (s.y > floorHeight) {
      particle(player.pos.x + 3, floorHeight, 3, 3, -PI / 2, PI / 7);
      return true;
    }
    rect(s, 2, -9);
    s.y += 6;
  });
  nextEnemyTicks--;
  nextWallTicks--;
  nextFlyingTicks--;
  if (nextEnemyTicks < 0) {
    var vx = -rnd(1, 2) * df;
    enemies.push({
      pos: vec(200, floorHeight),
      vx: vx,
      isFlying: false
    });
    nextEnemyTicks = rnd(30, 60) / difficulty;
  }
  if (nextWallTicks < 0) {
    var _vx = -rnd(1, 2) * df;
    var c = rndi(3, 6);
    times(c, function (i) {
      enemies.push({
        pos: vec(200, floorHeight - i * 6),
        vx: _vx,
        isFlying: false
      });
    });
    nextWallTicks = rnd(100, 600) / difficulty;
    nextEnemyTicks += 9 / difficulty;
  }
  if (nextFlyingTicks < 0) {
    var _vx2 = -rnd(1, 2) * df;
    var _c = rndi(1, 5);
    var p = vec(206, rnd(50, 80));
    times(_c, function () {
      enemies.push({
        pos: vec(p),
        vx: _vx2,
        isFlying: true
      });
      p.x += 7;
    });
    nextFlyingTicks = rnd(100, 400) / difficulty;
    nextEnemyTicks += 9 / difficulty;
  }
  color("red");
  remove(enemies, function (e) {
    e.pos.x += e.vx;
    var c = char(addWithCharCode(e.isFlying ? "e" : "c", floor(animTicks / 20) % 2), e.pos.x + 3, e.pos.y - 3, {
      mirror: {
        x: -1
      }
    }).isColliding;
    if (c.rect.light_blue) {
      play("coin");
      addScore(player.multiplier, e.pos.x + player.multiplier * 2, e.pos.y);
      particle(e.pos.x + 2, e.pos.y, 3, 2, -PI / 2, PI);
      player.multiplier++;
      return true;
    } else if (c["char"].a || c["char"].b) {
      play("explosion");
      rewind();
    }
    return e.pos.x < -6;
  });
}

