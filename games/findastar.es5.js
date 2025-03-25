title = "FIND A STAR";
description = "\n[Tap] Open\n";
characters = ["\n lll\nl   l\nl   l\nlllll\nl l l\nlllll\n", "\n lll\nl  l\nl l\nlllll\nl   l\nlllll\n", "\n  ll\nl ll l\n llll\n llll\n l  l\nl    l\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 9
};
var boxCount = 16;
var boxLeftX = 5;
var boxLines;
var boxLineAddDist;
var stars;
var pvy;
function update() {
  if (!ticks) {
    boxLines = [];
    boxLineAddDist = 0;
    stars = [];
    pvy = 0;
  }
  var ibx = floor((input.pos.x - boxLeftX + 3) / 6);
  if (input.isJustPressed && ibx >= 0 && ibx < boxCount) {
    play("laser");
    color("blue");
    rect(boxLeftX + ibx * 6, 0, 1, 99);
    pvy += 2;
  }
  var scr = difficulty * 0.06 + pvy;
  pvy *= 0.07;
  boxLineAddDist -= scr;
  if (boxLineAddDist < 0) {
    play("select");
    boxLines.push({
      y: -3,
      sx: rndi(boxCount),
      isOpened: times(boxCount, function () {
        return false;
      })
    });
    boxLineAddDist += 5 + 5 / difficulty;
  }
  var lc = 0;
  var ml = 1;
  boxLines = boxLines.filter(function (l) {
    lc++;
    if (l.y < 9) {
      l.y += (9 - l.y) * 0.2;
    } else if (input.isJustPressed && ibx >= 0 && ibx < boxCount) {
      if (ibx === l.sx) {
        play("coin");
        stars.push({
          pos: vec(boxLeftX + ibx * 6, l.y),
          vy: 1,
          angle: 0,
          score: lc * lc * ml
        });
        ml++;
        return false;
      } else if (ibx > l.sx) {
        for (var i = ibx; i < boxCount; i++) {
          l.isOpened[i] = true;
        }
      } else {
        for (var _i = 0; _i <= ibx; _i++) {
          l.isOpened[_i] = true;
        }
      }
    }
    l.y += scr;
    for (var _i2 = 0; _i2 < boxCount; _i2++) {
      color(l.isOpened[_i2] ? "light_blue" : "blue");
      char(l.isOpened[_i2] ? "b" : "a", boxLeftX + _i2 * 6, l.y);
    }
    if (l.y > 97) {
      play("explosion");
      end();
    }
    return true;
  });
  if (boxLines.length === 0) {
    boxLineAddDist = 0;
  }
  color("yellow");
  stars = stars.filter(function (s) {
    char("c", s.pos, {
      scale: {
        x: cos(s.angle),
        y: 1
      }
    });
    s.pos.y += s.vy;
    s.vy *= 0.9;
    s.angle += 0.2;
    if (s.angle > PI * 2) {
      play("powerUp");
      addScore(s.score, s.pos);
      return false;
    }
    return true;
  });
}

