title = "TWO FACED";
description = "\n[Tap]  Turn\n[Hold] Go forward\n";
characters = ["\n RRRR\nRr rrR\nR rrrR\nRrrrrR\nRrrrrR\n RRRR\n"];
options = {
  viewSize: {
    x: 200,
    y: 100
  },
  isDrawingScoreFront: true,
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 9
};
var head;
var tails;
var tailCount;
var lightTailCount;
var item;
var multiplier;
function update() {
  if (!ticks) {
    head = {
      pos: vec(0, 20),
      side: -1,
      angle: -PI / 2,
      av: 1,
      speed: 1,
      baseSpeed: 1
    };
    tails = [];
    tailCount = multiplier = 3;
    lightTailCount = 2;
    item = {
      pos: vec(),
      side: -1,
      angle: 0
    };
  }
  var sd = sqrt(difficulty);
  var v = vec();
  if (input.isJustPressed) {
    play("laser");
    head.av *= -1;
    head.speed += 0.1;
  }
  if (input.isPressed) {
    play("hit");
    head.speed += 0.01;
  } else {
    head.speed += (1 - head.speed) * 0.1;
    head.angle += head.av * 0.03 * sd * head.speed * head.baseSpeed;
  }
  head.baseSpeed *= 1.002;
  head.pos.addWithAngle(head.angle, sd * 0.5 * head.speed * head.baseSpeed);
  checkSide(head);
  tails.unshift({
    pos: vec(head.pos),
    side: head.side,
    angle: head.angle
  });
  if (tails.length > 256) {
    tails.pop();
  }
  item.pos.addWithAngle(item.angle, sd * 0.2);
  checkSide(item);
  color("black");
  if (item.side === -1) {
    char("a", item.pos.x + 150, item.pos.y + 50);
  }
  if (item.side === 1) {
    char("a", item.pos.x + 50, item.pos.y + 50);
  }
  color("green");
  if (head.side === -1) {
    bar(head.pos.x + 150, head.pos.y + 50, 3, 4, head.angle);
  }
  if (head.side === 1) {
    bar(head.pos.x + 50, head.pos.y + 50, 3, 4, head.angle);
  }
  color("light_yellow");
  box(50, 50, 80);
  color("light_purple");
  box(150, 50, 80);
  color("black");
  if (item.side === -1) {
    char("a", item.pos.x + 50, item.pos.y + 50);
  }
  if (item.side === 1) {
    char("a", item.pos.x + 150, item.pos.y + 50);
  }
  color("light_green");
  lightTailCount += (2 - lightTailCount) * 0.03;
  times(tailCount, function (i) {
    var ti = i * 9;
    if (ti >= tails.length) {
      return;
    }
    color(i < lightTailCount ? "light_black" : "light_green");
    var t = tails[ti];
    if (t.side === -1) {
      var c = bar(t.pos.x + 50, t.pos.y + 50, 4, 3, t.angle).isColliding["char"];
      if (item.side === -1 && c.a) {
        getItem(t.pos.x + 50, t.pos.y + 50);
      }
    }
    if (t.side === 1) {
      var _c = bar(t.pos.x + 150, t.pos.y + 50, 4, 3, t.angle).isColliding["char"];
      if (item.side === 1 && _c.a) {
        getItem(t.pos.x + 150, t.pos.y + 50);
      }
    }
  });
  color("green");
  if (head.side === -1) {
    var c = bar(head.pos.x + 50, head.pos.y + 50, 3, 4, head.angle).isColliding;
    if (item.side === -1 && c["char"].a) {
      getItem(head.pos.x + 50, head.pos.y + 50);
    }
    if (c.rect.light_green) {
      play("explosion");
      end();
    }
  }
  if (head.side === 1) {
    var _c2 = bar(head.pos.x + 150, head.pos.y + 50, 3, 4, head.angle).isColliding;
    if (item.side === 1 && _c2["char"].a) {
      getItem(head.pos.x + 150, head.pos.y + 50);
    }
    if (_c2.rect.light_green) {
      play("explosion");
      end();
    }
  }
  var pp = ceil(multiplier);
  multiplier -= 0.01;
  if (multiplier < 1) {
    multiplier = 1;
  }
  if (ceil(multiplier) < pp) {
    play("coin");
  }
  color("black");
  text("x".concat(ceil(multiplier)), 3, 9);
  function getItem(x, y) {
    play("powerUp");
    head.baseSpeed = 1;
    addScore(ceil(multiplier), x, y);
    if (tailCount < 25) {
      tailCount++;
    }
    multiplier += tailCount;
    item.pos.set(rnds(35), rnds(35));
    item.angle = rnds(PI);
    item.side = head.side * -1;
  }
  function checkSide(a) {
    v.set().addWithAngle(a.angle, 1);
    if (a.pos.x < -40 && v.x < 0 || a.pos.x > 40 && v.x > 0) {
      a.side *= -1;
      v.x *= -1;
      if (a.hasOwnProperty("av")) {
        a.av *= -1;
        lightTailCount += 2;
      }
    }
    if (a.pos.y < -40 && v.y < 0 || a.pos.y > 40 && v.y > 0) {
      a.side *= -1;
      v.y *= -1;
      if (a.hasOwnProperty("av")) {
        a.av *= -1;
        lightTailCount += 2;
      }
    }
    if (lightTailCount >= tailCount - 1) {
      lightTailCount = tailCount - 1;
    }
    a.angle = v.angle;
  }
}

