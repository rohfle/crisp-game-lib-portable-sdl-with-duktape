title = "COUNT";
description = "\n[Tap]\nStop counter\n";
characters = ["\n  rr\n rRRr\nrRRRRr\nrRRRRr\n rRRr\n  rr\n", "\n  gg\n gGGg\ngGGGGg\ngGGGGg\n gGGg\n  gg\n", "\n  bb\n bBBb\nbBBBBb\nbBBBBb\n bBBb\n  bb\n", "\nrrrrrr\nrRRRRr\nrRRRRr\nrRRRRr\nrRRRRr\nrrrrrr\n", "\ngggggg\ngGGGGg\ngGGGGg\ngGGGGg\ngGGGGg\ngggggg\n", "\nbbbbbb\nbBBBBb\nbBBBBb\nbBBBBb\nbBBBBb\nbbbbbb\n", "\n  rr\n  rr\n rRRr\n rRRr\nrRRRRr\nrrrrrr\n", "\n  gg\n  gg\n gGGg\n gGGg\ngGGGGg\ngggggg\n", "\n  bb\n  bb\n bBBb\n bBBb\nbBBBBb\nbbbbbb\n"];
options = {
  isPlayingBgm: true
};
var objs, count, countTicks, targets, targetCount, turn, isPressed, nextTurnTicks;
function update() {
  if (ticks === 0) {
    objs = [];
    turn = 1;
    isPressed = false;
  }
  if (objs.length === 0) {
    var checkNearest = function checkNearest(obj) {
      var isColliding = false;
      objs.forEach(function (o) {
        if (o.p.distanceTo(obj.p) < (o.scale + obj.scale) * 3) {
          isColliding = true;
        }
      });
      return isColliding;
    };
    objs = [];
    var scaleMax = rnd() > wrap(sqrt(turn) * 0.1, 0, 0.5) ? 1 : 3;
    var isRandType = rnd() > wrap(sqrt(turn) * 0.2, 0.5, 1) ? false : true;
    var isRandColor = rnd() > wrap(sqrt(turn) * 0.2, 0.5, 1) ? false : true;
    if (!isRandType && !isRandColor) {
      if (rnd() < 0.5) {
        isRandType = true;
      } else {
        isRandColor = true;
      }
    }
    var isTypeTarget = isRandType;
    var isColorTarget = isRandColor;
    if (isTypeTarget && isColorTarget) {
      if (rnd() < 0.5) {
        isTypeTarget = false;
      } else {
        isColorTarget = false;
      }
    }
    var ty = rndi(3);
    var cl = rndi(3);
    range(3 + floor(sqrt(turn) + rndi(turn))).forEach(function () {
      var o = {
        p: vec(rnd(10, 90), rnd(30, 90)),
        type: isRandType ? rndi(3) : ty,
        color: isRandColor ? rndi(3) : cl,
        scale: rnd(1, scaleMax),
        isTarget: false
      };
      if (!checkNearest(o)) {
        objs.push(o);
      }
    });
    var target = objs[rndi(objs.length)];
    targetCount = 0;
    var targetObjs = {};
    objs.forEach(function (o) {
      if ((!isTypeTarget || o.type === target.type) && (!isColorTarget || o.color === target.color)) {
        o.isTarget = true;
        var to = {
          type: o.type,
          color: o.color
        };
        targetObjs[JSON.stringify(to)] = true;
        targetCount++;
      }
    });
    targets = Object.keys(targetObjs).map(function (to) {
      return JSON.parse(to);
    });
    count = 0;
    countTicks = 79;
    isPressed = false;
  }
  text("How many", 4, 12);
  var x = 56;
  targets.forEach(function (o) {
    char(addWithCharCode("a", o.type * 3 + o.color), x, 12, {});
    x += 7;
  });
  text("? ".concat(count), x, 12);
  if (!isPressed) {
    objs.forEach(function (o) {
      char(addWithCharCode("a", o.type * 3 + o.color), o.p, {
        scale: {
          x: o.scale,
          y: o.scale
        }
      });
    });
    countTicks -= difficulty;
    if (input.isJustPressed || count > targetCount) {
      isPressed = true;
      nextTurnTicks = 0;
      if (count === targetCount) {
        addScore(1);
        play("powerUp");
      } else {
        play("lucky");
      }
    } else if (countTicks < 0) {
      play("select");
      count++;
      countTicks = 60;
    }
  } else {
    if (count === targetCount) {
      text("OK!", 80, 20);
    } else {
      text("ERROR", 70, 20);
    }
    nextTurnTicks++;
    if (nextTurnTicks > 90) {
      if (count === targetCount) {
        turn++;
        objs = [];
      } else {
        end();
        return;
      }
    }
    text("".concat(targetCount), 50, 50, {
      scale: {
        x: 3,
        y: 3
      }
    });
    objs.forEach(function (o) {
      if (o.isTarget) {
        char(addWithCharCode("a", o.type * 3 + o.color), o.p, {
          scale: {
            x: o.scale,
            y: o.scale
          }
        });
      }
    });
  }
}

