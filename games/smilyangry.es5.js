title = "SMILY ANGRY";
description = "\n[Tap] Turn\n";
characters = ["\n llll\nl ll l\n llll \nl ll l\nll  ll\n llll\n", "\n llll\nl ll l\nllllll\nll  ll\nl ll l\n llll\n", "\nllllll\nll l l\nll l l\nllllll\n l  l\n l  l\n  ", "\nllllll\nll l l\nll l l\nllllll\nll  ll\n  "];
options = {
  theme: "crt",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 1
};
var smiles;
var bullets;
var player;
var multiplier;
function update() {
  if (!ticks) {
    smiles = [{
      pos: vec(30, 20),
      targetPos: vec(30, 20),
      fireInterval: 30,
      fireSpeed: 1,
      fireTicks: 20,
      isSmile: true,
      isRed: true
    }, {
      pos: vec(70, 20),
      targetPos: vec(70, 20),
      fireInterval: 30,
      fireSpeed: 1,
      fireTicks: 50,
      isSmile: false,
      isRed: false
    }];
    bullets = [];
    player = {
      pos: vec(50, 90),
      vx: 1,
      speed: 1
    };
    multiplier = 1;
  }
  color("light_black");
  rect(0, 93, 100, 7);
  smiles.forEach(function (s) {
    s.pos.x += (s.targetPos.x - s.pos.x) * 0.1;
    s.pos.y += (s.targetPos.y - s.pos.y) * 0.1;
    s.fireTicks--;
    if (s.fireTicks < 0) {
      fire(s.pos, s.fireSpeed, s.isSmile, s.isRed);
      s.fireTicks = s.fireInterval;
    }
    var changeRatio = 0.002 * sqrt(difficulty);
    if (rnd() < changeRatio) {
      s.targetPos.set(rnd(10, 90), rnd(10, 40));
    }
    if (rnd() < changeRatio) {
      s.isSmile = !s.isSmile;
    }
    if (rnd() < changeRatio) {
      s.isRed = !s.isRed;
    }
    if (rnd() < changeRatio) {
      s.fireInterval = rnd(30, 40) / sqrt(difficulty);
      s.fireSpeed = rnd(0.9, 1.2) * sqrt(difficulty);
    }
    color(s.isRed ? s.isSmile ? "yellow" : "red" : s.isSmile ? "green" : "cyan");
    char(s.isSmile ? "a" : "b", s.pos);
  });
  player.speed = sqrt(difficulty) * 0.5;
  if (input.isJustPressed) {
    play("select");
    player.vx *= -1;
  }
  player.pos.x = wrap(player.pos.x + player.vx * player.speed, -3, 103);
  color("black");
  var c = char(addWithCharCode("c", floor(ticks / 30) % 2), player.pos, {
    mirror: {
      x: player.vx
    }
  }).isColliding;
  remove(bullets, function (b) {
    b.pos.add(b.vel);
    b.pos.x = wrap(b.pos.x, -3, 103);
    color(b.isRed ? "red" : "cyan");
    var c;
    if (b.isBonus) {
      c = text("$", b.pos).isColliding;
    } else {
      c = bar(b.pos, 3, 2, b.vel.angle).isColliding;
    }
    if (c["char"].c || c["char"].d) {
      if (b.isBonus) {
        play("powerUp");
        addScore(multiplier, player.pos);
        multiplier++;
        return true;
      } else {
        play("explosion");
        end();
      }
    }
    if (c.rect.light_black) {
      if (b.isBonus && multiplier > 1) {
        multiplier--;
      }
      return true;
    }
  });
  function fire(pos, speed, isSmile, isRed) {
    play(isSmile ? "laser" : "hit");
    if (isRed) {
      var t1 = player.pos.distanceTo(pos) / speed;
      var t2 = vec(player.pos.x + t1 * player.vx * player.speed, player.pos.y).distanceTo(pos) / speed;
      var vel = vec().addWithAngle(pos.angleTo(vec(player.pos.x + t2 * player.vx * player.speed, player.pos.y)), speed);
      bullets.push({
        pos: vec(pos),
        vel: vel,
        isRed: isRed,
        isBonus: isSmile
      });
    } else {
      var _vel = vec().addWithAngle(pos.angleTo(player.pos), speed);
      bullets.push({
        pos: vec(pos),
        vel: _vel,
        isRed: isRed,
        isBonus: isSmile
      });
    }
  }
}

