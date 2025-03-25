title = "NOT TURN";
description = "\n[Hold]\n Turn & Speed up\n";
characters = ["\nllllll\nll l l\nll l l\nllllll\n l  l\n l  l\n    ", "\n\nllllll\nll l l\nll l l\nllllll\nll  ll\n    ", "\nllllll\nl ll l\nl ll l\nllllll\n l  l\n l  l\n    ", "\n\nllllll\nl ll l\nl ll l\nllllll\n l  l\n    ", "\n  lll\nll l l\n llll\n  ll\n l  l\n l  l\n  ", "\n\n  lll\nll l l\n llll\n l  l\nll  ll\n  ", "\n llll\nl ll l\n llll\n  ll\n l  l\n l  l\n  ", "\n\n llll\nl ll l\n llll\n  ll\n l  l\n  ", "\n  ll\n l ll\n llll\n  ll\n  "];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 80
};
var bars;
var nextBarDist;
var enemies;
var nextEnemyTicks;
var player;
var dots;
var multiplier;
var xBarCount = 5;
var xBarInterval = 20;
var xBarPadding = (100 - (xBarCount - 1) * xBarInterval) / 2;
function update() {
  if (!ticks) {
    bars = [];
    nextBarDist = 0;
    enemies = [];
    nextEnemyTicks = 20;
    var xIndex = 2;
    player = {
      pos: vec(xBarPadding + xBarInterval * xIndex, 99),
      vel: vec(0, 1),
      xIndex: xIndex,
      noTurnDist: 5,
      speed: 1
    };
    dots = [];
    multiplier = 1;
  }
  var scr;
  if (player.pos.y > 20) {
    scr = (player.pos.y - 20) * 0.1;
  }
  nextBarDist -= scr;
  if (nextBarDist < 0) {
    var i1 = rndi(xBarCount - 1);
    var i2 = rndi(xBarCount - 1);
    bars.push({
      pos: vec(calcBarX(i1) + xBarInterval / 2, 102)
    });
    if (abs(i2 - i1) > 1) {
      bars.push({
        pos: vec(calcBarX(i2) + xBarInterval / 2, 102)
      });
    }
    nextBarDist += rnd(9, 12);
  }
  color("light_black");
  times(xBarCount, function (i) {
    box(calcBarX(i), 50, 3, 100);
  });
  color("light_blue");
  remove(bars, function (b) {
    b.pos.y -= scr;
    box(b.pos, xBarInterval - 3, 3);
    return b.pos.y < -1;
  });
  var sp = clamp(sqrt(difficulty) * player.speed * 0.2, 0, 3);
  player.pos.add(vec(player.vel).mul(sp));
  player.noTurnDist -= player.vel.y * sp;
  var pc;
  if (player.vel.x !== 0) {
    var bx = calcBarX(player.xIndex);
    if ((player.pos.x - bx) * player.vel.x > 0) {
      player.pos.x = bx;
      player.vel.set(0, 1);
    }
    pc = addWithCharCode("a", floor(ticks / (input.isPressed ? 10 : 20)) % 2);
  } else {
    if (player.noTurnDist < 0 && input.isPressed) {
      color("transparent");
      if (box(player.pos.x + 6, player.pos.y + 3, 1, 1).isColliding.rect.light_blue) {
        play("select");
        player.vel.set(1, 0);
        player.xIndex++;
        player.noTurnDist = 5;
      } else if (box(player.pos.x - 6, player.pos.y + 3, 1, 1).isColliding.rect.light_blue) {
        play("select");
        player.vel.set(-1, 0);
        player.xIndex--;
        player.noTurnDist = 5;
      }
    }
    pc = addWithCharCode("c", floor(ticks / (input.isPressed ? 10 : 20)) % 2);
  }
  if (input.isJustPressed) {
    play("laser");
  }
  if (input.isJustReleased) {
    play("hit");
  }
  player.speed += ((input.isPressed ? 4 : 1) - player.speed) * 0.2;
  color("black");
  char(pc, player.pos, {
    mirror: {
      x: player.vel.x > 0 ? 1 : -1
    }
  });
  player.pos.y -= scr;
  nextEnemyTicks--;
  if (nextEnemyTicks < 0) {
    var _xIndex = rndi(xBarCount);
    enemies.push({
      pos: vec(calcBarX(_xIndex), 103),
      vel: vec(0, -1),
      xIndex: _xIndex,
      noTurnDist: 0,
      dotDist: 0
    });
    nextEnemyTicks = rnd(100, 150) / difficulty;
  }
  remove(enemies, function (e) {
    var sp = clamp(sqrt(difficulty) * 0.3, 0, 3);
    e.pos.add(vec(e.vel).mul(sp));
    e.noTurnDist += e.vel.y * sp;
    if (e.vel.x !== 0) {
      var _bx = calcBarX(e.xIndex);
      if ((e.pos.x - _bx) * e.vel.x > 0) {
        e.pos.x = _bx;
        e.vel.set(0, -1);
      }
    } else if (e.noTurnDist < 0) {
      color("transparent");
      if (box(e.pos.x + 6, e.pos.y + 3, 1, 1).isColliding.rect.light_blue) {
        e.vel.set(1, 0);
        e.xIndex++;
        e.noTurnDist = 5;
      } else if (box(e.pos.x - 6, e.pos.y + 3, 1, 1).isColliding.rect.light_blue) {
        e.vel.set(-1, 0);
        e.xIndex--;
        e.noTurnDist = 5;
      }
    }
    color("red");
    var c = char("e", e.pos).isColliding["char"];
    if (c.a || c.b || c.c || c.d) {
      play("explosion");
      end();
    }
    e.pos.y -= scr;
    e.dotDist -= sp;
    if (e.dotDist < 0) {
      e.dotDist += 6;
      dots.push({
        pos: vec(e.pos)
      });
    }
    if (e.pos.y < -3) {
      if (multiplier > 1) {
        multiplier--;
      }
      return true;
    }
  });
  color("yellow");
  remove(dots, function (d) {
    var c = char("i", d.pos).isColliding["char"];
    if (c.a || c.b || c.c || c.d) {
      play("coin");
      addScore(multiplier, d.pos);
      multiplier++;
      return true;
    }
    d.pos.y -= scr;
    return d.pos.y < -3;
  });
  color("black");
  text("x".concat(multiplier), 3, 10);
  function calcBarX(i) {
    return i * xBarInterval + xBarPadding;
  }
}

