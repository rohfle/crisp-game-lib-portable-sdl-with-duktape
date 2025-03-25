title = "THROW M";
description = "\n[Hold]\n Set angle\n[Release]\n Shoot\n";
characters = ["\nllllll\nll l l\nll l l\nllllll\n l  l\n l  l\n  ", "\n  lll\nll l l\n llll\n  ll\n l  l\n l  l\n", "\n lll\nll ll\nl lll\nlllll\n lll\n  ll\n", "\nr  r\nllllrr\nr  r\n", "\n yyyy\n y yy\nl yyyl\nlyyyyl\n yyyy\n yyyy\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 6
};
var enemies;
var nextEnemyTicks;
var bullets;
var player;
var shots;
var multiplier;
function update() {
  if (!ticks) {
    enemies = [];
    nextEnemyTicks = 0;
    bullets = [];
    player = {
      pos: vec(90, 50),
      vy: -1,
      fireAngle: undefined
    };
    shots = [];
    multiplier = 1;
  }
  color("light_black");
  rect(85, 0, 15, 10);
  rect(85, 92, 15, 8);
  color("black");
  remove(shots, function (s) {
    s.pos.add(s.vel);
    s.vel.y += difficulty * 0.07;
    char("e", s.pos);
    return s.pos.y > 103;
  });
  nextEnemyTicks--;
  if (nextEnemyTicks < 0) {
    var fireInterval = rnd(200, 300) / sqrt(difficulty);
    enemies.push({
      pos: vec(rnd(3, 50), -5),
      vy: rnd(0.1, 0.4) * difficulty,
      fireInterval: fireInterval,
      fireTicks: rnd(fireInterval),
      color: ["red", "cyan", "yellow", "green"][rndi(4)],
      isFalling: false
    });
    nextEnemyTicks = rnd(50, 60) / difficulty / sqrt(difficulty);
  }
  remove(enemies, function (e) {
    e.pos.y += e.vy;
    var isHit = false;
    if (e.isFalling) {
      e.vy += 0.1;
    } else {
      e.fireTicks--;
      if (e.fireTicks < 0) {
        bullets.push(vec(e.pos));
        e.fireTicks = e.fireInterval;
      }
      color(e.color);
      if (char("c", e.pos.x, e.pos.y - 6).isColliding["char"].e) {
        isHit = true;
      }
    }
    color("black");
    if (char("b", e.pos, {
      mirror: {
        y: e.isFalling ? -1 : 1
      }
    }).isColliding["char"].e && !e.isFalling) {
      isHit = true;
    }
    if (isHit) {
      play("powerUp");
      particle(e.pos.x, e.pos.y - 6);
      e.isFalling = true;
      addScore(multiplier, e.pos);
      multiplier *= 2;
    }
    return e.pos.y > 105;
  });
  var bs = difficulty * 0.5;
  color("black");
  remove(bullets, function (b) {
    b.x += bs;
    var c = char("d", b).isColliding;
    if (c["char"].e) {
      play("hit");
      particle(b);
      addScore(multiplier, b);
      multiplier++;
      return true;
    }
    return b.x > 103 || c.rect.light_black;
  });
  player.pos.y += player.vy * difficulty * 0.5;
  if (player.pos.y < 19 && player.vy < 0 || player.pos.y > 90 && player.vy > 0) {
    player.vy *= -1;
  }
  color("blue");
  if (char("c", player.pos.x, player.pos.y - 6, {
    mirror: {
      x: -1
    }
  }).isColliding["char"].d) {
    play("explosion");
    end();
  }
  color("black");
  char("b", player.pos.x, player.pos.y, {
    mirror: {
      x: -1
    }
  });
  if (player.fireAngle == null) {
    if (input.isJustPressed) {
      player.fireAngle = PI / 4 * 3;
    }
  }
  if (player.fireAngle != null) {
    player.fireAngle += 0.1 * difficulty;
    color("black");
    line(player.pos, vec(player.pos).addWithAngle(player.fireAngle, 5), 2);
    if (input.isJustReleased || player.fireAngle > PI / 8 * 11) {
      play("laser");
      shots.push({
        pos: vec(player.pos),
        vel: vec().addWithAngle(player.fireAngle, sqrt(difficulty) * 3)
      });
      player.fireAngle = undefined;
      multiplier = 1;
    }
  }
}

