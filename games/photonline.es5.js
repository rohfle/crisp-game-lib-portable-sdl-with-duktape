title = "PHOTON LINE";
description = "\n[Tap]  Turn\n[Hold] Flick\n";
characters = ["\nrllllr\nlrllrl\nll lll \nllllll\nlrllrl\nrllllr\n", "\nr pprr\n ppprr\npp ppp\npppppp\nrrppp\nrrpp r\n", "\nr yyrr\n yyyrr\nyy yyy\nyyyyyy\nrryyy\nrryy r\n", "\nr ccrr\n cccrr\ncc ccc\ncccccc\nrrccc\nrrcc r\n", "\nr ggrr\n gggrr\ngg ggg\ngggggg\nrrggg\nrrgg r\n", "\nr    b\n r  b\n  rb\n  br\n b  r\nb    r\n", "\n   l\nllllll\nl    l\n llll\n ll\nl llll\n", "\n   l l\nllllll\nl   l\nlll ll\nl l ll\nl l ll\n"];
options = {
  viewSize: {
    x: 200,
    y: 100
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 2
};
var player;
var target;
var photons;
var nextPhotonTicks;
var appWidth;
var world;
var step;
var nextStepTicks;
var colorCount;
var nextPhotons;
function update() {
  if (!ticks) {
    player = {
      angle: 0,
      isRotating: false,
      ta: 0,
      hands: [[0], [1]]
    };
    target = [[0], [1]];
    photons = [];
    nextPhotonTicks = 0;
    world = step = 1;
    nextStepTicks = 0;
    appWidth = 30;
    colorCount = 2;
    nextPhotons = [];
  }
  if (nextStepTicks === 0) {
    if (step > clamp(world + 1, 1, 5)) {
      step = 1;
      world++;
      colorCount = clamp(rndi(2, world + 2), 2, 4);
      target = [[rndi(colorCount)], [rndi(colorCount)]];
      player.hands = [[target[0][0]], [target[1][0]]];
    }
    var prevTarget = [[], []];
    times(2, function (i) {
      return target[i].forEach(function (c) {
        prevTarget[i].push(c);
      });
    });
    target[0].splice(4);
    target[1].splice(4);
    var cr = 3 / colorCount;
    var ac = round(rnd(1, world) * cr);
    var dc = round(clamp(rnd(world) - 1, 0, 2) * cr);
    if (ac === dc) {
      dc--;
    }
    times(dc, function () {
      var h = target[rndi(2)];
      if (h.length > 0) {
        h.pop();
      }
    });
    times(ac + dc, function () {
      var h = target[rndi(2)];
      h.push(rndi(colorCount));
    });
    target[0].splice(5);
    target[1].splice(5);
    var isSame = target[0].length === prevTarget[0].length && target[1].length === prevTarget[1].length;
    if (isSame) {
      times(2, function (i) {
        return target[i].forEach(function (c, j) {
          if (prevTarget[i][j] !== c) {
            isSame = false;
          }
        });
      });
    }
    if (isSame) {
      target[0][target[0].length - 1] = wrap(target[0][target[0].length - 1] + 1, 0, colorCount);
    }
    step++;
    nextPhotonTicks = 60;
    appWidth = 30;
    nextPhotons = [];
  }
  if (nextStepTicks < 0 && nextStepTicks > -100) {
    text("WORLD ".concat(world, "   STEP ").concat(step - 1), 50, 20);
  }
  if (nextStepTicks > 0) {
    char("g", 80, 50);
    char("h", 120, 50);
    if (appWidth > -3) {
      appWidth--;
      addScore(world);
    }
  }
  nextStepTicks--;
  nextPhotonTicks--;
  if (nextPhotonTicks < 0) {
    if (nextPhotons.length === 0) {
      times(colorCount, function (i) {
        nextPhotons.push(i);
        nextPhotons.push(i);
      });
      times(ceil(colorCount * 0.4), function () {
        nextPhotons.push(4);
      });
      var nl = nextPhotons.length;
      times(99, function () {
        var i1 = rndi(nl);
        var i2 = rndi(nl);
        var t = nextPhotons[i1];
        nextPhotons[i1] = nextPhotons[i2];
        nextPhotons[i2] = t;
      });
    }
    var w = rnd() < 0.5 ? 1 : -1;
    var s = sqrt(difficulty) * 0.4;
    photons.push({
      x: w > 0 ? appWidth : 200 - appWidth,
      vx: w * s,
      w: w,
      index: nextPhotons.pop(),
      isReflected: false
    });
    nextPhotonTicks = rnd(60, 90) / sqrt(difficulty);
  }
  remove(photons, function (p) {
    p.x += p.vx;
    char(addWithCharCode("b", p.index), p.x, 60);
    if (p.isReflected) {
      return p.x < appWidth || p.x > 200 - appWidth;
    }
    var hi = wrap((p.w > 0 ? 0 : 1) + (player.angle < PI / 2 || player.angle > PI / 2 * 3 ? 0 : 1), 0, 2);
    var hl = player.hands[hi].length * 7 + 6;
    var x = 100 - hl * p.w;
    if (p.w === 1 && p.x > x || p.w === -1 && p.x < x) {
      if (player.isRotating) {
        play("laser");
        p.isReflected = true;
        p.vx *= -5;
      } else {
        var h = player.hands[hi];
        if (p.index === 4) {
          if (h.length > 0) {
            play("hit");
            particle(p.x, 60);
            h.pop();
          }
        } else {
          play("select");
          h.push(p.index);
          if (h.length > 9) {
            appWidth /= 2;
          }
        }
        var isMatching = true;
        times(2, function (i) {
          var t = target[i];
          if (t.length !== player.hands[i].length) {
            isMatching = false;
          } else {
            times(t.length, function (j) {
              if (t[j] !== player.hands[i][j]) {
                isMatching = false;
              }
            });
          }
        });
        if (isMatching && player.angle > PI / 2) {
          player.isRotating = true;
          player.ta += PI;
        }
        if (!isMatching) {
          isMatching = true;
          times(2, function (i) {
            var t = target[i];
            if (t.length !== player.hands[1 - i].length) {
              isMatching = false;
            } else {
              times(t.length, function (j) {
                if (t[j] !== player.hands[1 - i][j]) {
                  isMatching = false;
                }
              });
            }
          });
          if (isMatching && player.angle < PI / 2) {
            player.isRotating = true;
            player.ta += PI;
          }
        }
        if (isMatching) {
          play("powerUp");
          photons = [];
          nextStepTicks = 60;
          nextPhotonTicks = 9999;
        }
        return true;
      }
    }
  });
  char("a", 100, 30);
  var p = vec();
  target.forEach(function (is, w) {
    p.set(100, 30);
    is.forEach(function (i) {
      p.x += 7 * (w * 2 - 1);
      char(addWithCharCode("b", i), p);
    });
  });
  if (!player.isRotating && nextStepTicks < 0 && input.isJustPressed) {
    play("coin");
    player.isRotating = true;
    player.ta += PI;
  }
  if (player.isRotating) {
    player.angle += 0.2;
    if (player.angle >= player.ta) {
      if (!input.isPressed) {
        player.angle = player.ta;
        player.isRotating = false;
      } else {
        player.ta += PI;
      }
    }
    if (player.angle >= PI * 2) {
      player.angle -= PI * 2;
      player.ta -= PI * 2;
    }
  }
  char("a", 100, 60);
  player.hands.forEach(function (is, w) {
    p.set(100, 60);
    is.forEach(function (i) {
      p.addWithAngle(player.angle, 7 * (w * 2 - 1));
      char(addWithCharCode("b", i), p);
    });
  });
  appWidth -= 0.02;
  rect(0, 56, appWidth + 3, 8).isColliding["char"];
  rect(200, 56, -appWidth - 3, 8).isColliding["char"];
  if (nextStepTicks < 0 && appWidth < -3) {
    play("lucky");
    end();
  }
}

