title = "LIFT UP";
description = "\n[Hold]\n Go up fast\n";
characters = ["\nllllll\nll l l\nll l l\nllllll\n l  l\n l  l\n  ", "\nllllll\nll l l\nll l l\nllllll\nll  ll\n  ", "\nl   l\nllll\nlll\nllll\nl   l\n", "\n  ll\n   ll   \nllllll\n   ll   \n  ll\n", "\n llll\nl llll\nllll l\nllll l\nll   l\n llll\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 90
};
var walls;
var wallVx;
var wallVw;
var player;
var pressRatio;
var items;
var nextItemDist;
var bonusItemCount;
var bonusItemX;
var nextItemSide;
var topWallX;
var topWallW;
var multiplier;
function update() {
  if (!ticks) {
    walls = times(19, function (i) {
      return {
        pos: vec(50, i * 6 - 3),
        width: 60
      };
    });
    wallVx = 0;
    wallVw = 0;
    player = {
      pos: vec(40, 90),
      vx: 1,
      ty: 90
    };
    pressRatio = 0;
    items = [];
    nextItemDist = bonusItemCount = bonusItemX = 0;
    nextItemSide = 1;
    topWallX = 50;
    topWallW = 60;
    multiplier = 1;
  }
  pressRatio += ((input.isPressed ? 1 : 0) - pressRatio) * 0.1;
  var scr = difficulty * (1 + pressRatio * 3) * 0.2;
  walls.forEach(function (w, i) {
    w.pos.y += scr;
    if (w.pos.y > 110) {
      w.pos.y -= walls.length * 6;
      var pw = walls[wrap(i - 1, 0, walls.length)];
      topWallX = w.pos.x = pw.pos.x + wallVx;
      topWallW = w.width = pw.width + wallVw;
      wallVx = clamp(wallVx + rnds(1) * sqrt(difficulty), -5, 5);
      wallVw = clamp(wallVw + rnds(1) * sqrt(difficulty), -3, 3);
      wallVx *= 0.95;
      wallVw *= 0.95;
      if (w.pos.x + w.width / 2 > 95 && wallVx > 0 || w.pos.x - w.width / 2 < 5 && wallVx < 0) {
        wallVx *= -0.5;
      }
      if (w.width > 80 && wallVw > 0 || w.width < 40 && wallVw < 0) {
        wallVw *= -0.5;
      }
    }
    color("red");
    char("c", w.pos.x - w.width / 2, w.pos.y);
    char("c", w.pos.x + w.width / 2, w.pos.y, {
      mirror: {
        x: -1
      }
    });
    color("light_red");
    rect(w.pos.x - w.width / 2 - 2, w.pos.y - 2, -70, 5);
    rect(w.pos.x + w.width / 2 + 2, w.pos.y - 2, 70, 5);
  });
  nextItemDist -= scr;
  if (nextItemDist < 0) {
    if (bonusItemCount > 0) {
      items.push({
        pos: vec(bonusItemX, -3),
        type: "bonus"
      });
      nextItemDist = 6;
    } else {
      if (bonusItemCount < 0 && rnd() < 0.5) {
        bonusItemCount = rndi(2, 6);
        bonusItemX = topWallX + rnds(topWallW * 0.25);
        nextItemDist = 0;
      } else {
        var x = topWallX + rnd(0.1, 0.4) * nextItemSide * topWallW;
        if (rnd() < 0.8) {
          nextItemSide *= -1;
        }
        items.push({
          pos: vec(x, -3),
          type: "turn"
        });
        nextItemDist = rnd(10, 20);
      }
    }
    bonusItemCount--;
  }
  if (input.isJustPressed) {
    play("select");
  }
  player.pos.x += player.vx * 0.05 * difficulty * (4 - pressRatio * 3);
  player.ty -= sqrt(difficulty) * 0.04;
  player.pos.y += (player.ty - player.pos.y) * 0.2;
  color("black");
  var c = char(addWithCharCode("a", floor(ticks / 15) % 2), player.pos, {
    mirror: {
      x: player.vx < 0 ? -1 : 1
    }
  }).isColliding;
  if (c.rect.light_red || c["char"].c) {
    play("explosion");
    end();
  }
  remove(items, function (i) {
    i.pos.y += scr;
    if (i.type === "turn") {
      color("cyan");
      var _c = char("d", i.pos, {
        mirror: {
          x: player.vx > 0 ? -1 : 1
        }
      }).isColliding;
      if (_c.rect.light_red || _c["char"].c) {
        i.pos.x += i.pos.x > topWallX ? -1 : 1;
      }
      if (_c["char"].a || _c["char"].b) {
        play("laser");
        player.vx *= -1;
        return true;
      }
    } else {
      color("yellow");
      var _c2 = char("e", i.pos).isColliding;
      if (_c2.rect.light_red || _c2["char"].c) {
        i.pos.x += i.pos.x > topWallX ? -1 : 1;
      }
      if (_c2["char"].a || _c2["char"].b) {
        play("coin");
        addScore(multiplier, i.pos);
        multiplier = clamp(multiplier + 1, 1, 99);
        player.ty += (99 - player.ty) * 0.1;
        return true;
      }
    }
    if (i.pos.y > 103) {
      if (i.type === "bonus") {
        multiplier = clamp(multiplier - 1, 1, 99);
      }
      return true;
    }
  });
  color("black");
  rect(0, player.pos.y + 3, 100, 6);
  if (player.pos.y < 0) {
    play("explosion");
    end();
  }
}

