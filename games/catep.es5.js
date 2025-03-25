title = "CATE P";
description = "\n[Tap]\n Turn & Shot\n";
characters = ["\n llll\nllllll\nlllrrr\nlllrrr\nllllll\n llll\n", "\n llll\nllllll\nlll\nlll\nllllll\n llll\n", "\nl ll\n    l\nlllll\n    l\nl ll\n"];
options = {
  theme: "pixel",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 11
};
var cates;
var appCate;
var appearingCate;
var appCateTicks;
var player;
var shot;
var angleVec = [vec(1, 0), vec(0.7, 0.7), vec(0, 1), vec(-0.7, 0.7), vec(-1, 0), vec(-0.7, -0.7), vec(0, -1), vec(0.7, -0.7)];
function update() {
  if (!ticks) {
    cates = [];
    appCateTicks = 0;
    appearingCate = undefined;
    player = {
      pos: vec(50, 50),
      angle: 0
    };
    shot = undefined;
  }
  color("light_blue");
  rect(0, 0, 99, 6);
  rect(0, 93, 99, 6);
  rect(0, 6, 6, 87);
  rect(93, 6, 6, 87);
  if (ticks && input.isJustPressed || !player.pos.isInRect(9, 9, 82, 82)) {
    if (shot == null && input.isJustPressed) {
      play("powerUp");
      shot = {
        pos: vec(player.pos),
        angle: player.angle,
        multiplier: 1
      };
    }
    player.pos.clamp(9, 90, 9, 90);
    player.angle = wrap(player.angle + 2, 0, 8);
  }
  player.pos.add(vec(angleVec[player.angle]).mul(difficulty * 0.2));
  color("black");
  char(shot == null ? "a" : "b", player.pos, {
    rotation: player.angle / 2
  });
  if (shot != null) {
    if (!shot.pos.isInRect(9, 9, 82, 82)) {
      shot = undefined;
    } else {
      shot.pos.add(vec(angleVec[shot.angle]).mul(difficulty * 1.5));
      char("c", shot.pos, {
        rotation: shot.angle / 2
      });
    }
  }
  if (appCateTicks <= 0) {
    appCate = {
      pos: vec(rnd(9, 90), rnd() < 0.5 ? -3 : 103),
      angle: 0,
      speed: rnd(1, difficulty) * 0.2,
      ticks: rnd(999),
      count: rndi(5, 9)
    };
    if (rnd() < 0.5) {
      appCate.pos.swapXy();
    }
    appCate.angle = appCate.pos.x > 99 ? 4 : appCate.pos.y > 99 ? 6 : appCate.pos.x < 0 ? 0 : 2;
    appCateTicks = rnd(60, 90) / difficulty;
  }
  appCate.ticks += appCate.speed;
  if (appCate.count <= 0) {
    appCateTicks--;
  }
  if (appearingCate != null) {
    if (appearingCate.pos.isInRect(3, 3, 94, 94)) {
      appearingCate = undefined;
    }
  }
  if (appCate.count > 0 && appearingCate == null) {
    play("laser");
    var c = {
      pos: vec(appCate.pos),
      angle: appCate.angle,
      speed: appCate.speed,
      ticks: appCate.ticks,
      isAppearing: true
    };
    cates.push(c);
    appearingCate = c;
    appCate.count--;
  }
  cates = cates.filter(function (c) {
    var av = angleVec[c.angle];
    c.pos.add(av.x * c.speed, av.y * c.speed);
    if (c.isAppearing) {
      c.isAppearing = !c.pos.isInRect(9, 9, 81, 81);
    } else {
      var hitCount = 0;
      if (c.pos.x < 9 || c.pos.x > 90) {
        hitCount++;
      }
      if (c.pos.y < 9 || c.pos.y > 90) {
        hitCount++;
      }
      if (hitCount === 1) {
        c.angle = wrap(c.angle + 3, 0, 8);
        c.pos.clamp(9, 90, 9, 90);
      } else if (hitCount === 2) {
        c.angle = wrap(c.angle + 4, 0, 8);
        c.pos.clamp(9, 90, 9, 90);
      }
    }
    c.ticks += c.speed;
    var t = wrap(c.ticks, 0, 8);
    var lo = t < 4 ? 5 * t / 5 - 2 : 5 * (8 - t) / 5 - 2;
    var o = vec(3, 0).rotate(c.angle * PI / 4 + PI / 2);
    var o2 = vec(lo, 0).rotate(c.angle * PI / 4);
    color("red");
    box(vec(c.pos).add(o).add(o2), 2, 2);
    box(vec(c.pos).sub(o).sub(o2), 2, 2);
    color("green");
    var cc = box(c.pos, 5, 5).isColliding["char"];
    if (cc.c) {
      play("coin");
      addScore(shot.multiplier, c.pos);
      particle(c.pos, 9, sqrt(shot.multiplier));
      shot.multiplier++;
      if (c === appearingCate) {
        appearingCate = undefined;
      }
      return false;
    }
    if (cc.a || cc.b) {
      play("explosion");
      end();
    }
    return true;
  });
}

