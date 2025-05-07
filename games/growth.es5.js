title = "GROWTH";
description = "\n[Hold] Growth\n";
characters = [];
options = {
  theme: "pixel",
  viewSize: {
    x: 200,
    y: 70
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 30
};
var player;
var enemies;
var nextEnemyDist;
var floorY = 60;
function update() {
  if (!ticks) {
    player = {
      x: 9,
      vx: 1,
      size: 5
    };
    enemies = [];
    nextEnemyDist = 0;
  }
  var scr = player.x > 9 ? (player.x - 9) * 0.5 : 0;
  color("light_blue");
  rect(0, floorY, 200, 10);
  if (input.isJustPressed) {
    play("laser");
  }
  player.size += ((input.isPressed ? 50 : 5) - player.size) * clamp(player.vx, 1, 999) * 0.01;
  player.vx += (15 / player.size - 1) * 0.02 * sqrt(difficulty);
  player.x += player.vx - scr;
  if (player.x + player.size / 2 < 1) {
    end();
  }
  color("yellow");
  rect(0, floorY, player.x + player.size / 2, -player.size);
  nextEnemyDist -= scr;
  if (nextEnemyDist < 0) {
    var size = rnd() < 0.8 ? 3 : rnd(5) * rnd(5) + 3;
    if (size < 7) {
      size = 3;
    }
    enemies.push({
      x: 400,
      size: size
    });
    nextEnemyDist += rnd(30, 50);
  }
  remove(enemies, function (e) {
    e.x -= scr;
    color(e.size > player.size ? "red" : "cyan");
    var sc = e.x > 100 ? (e.x - 100) / 300 + 1 : 1;
    var sz = e.size / sc;
    var c = rect(e.x / sc, floorY, sz, -sz).isColliding.rect;
    if (c.yellow) {
      if (e.size > player.size) {
        play("explosion");
        end();
      } else {
        play(e.size < 5 ? "hit" : "powerUp");
        var ss = sqrt(e.size);
        particle(e.x, floorY - e.size / 2, ss, ss, 0, PI / 2);
        addScore(ceil(clamp(player.vx, 1, 999) * e.size), e.x, floorY - player.size);
      }
      return true;
    }
  });
}

