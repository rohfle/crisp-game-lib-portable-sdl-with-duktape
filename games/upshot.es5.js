title = "UP SHOT";
description = "\n[Hold]\n Stop & Shoot\n[Release]\n Run\n";
characters = ["\nllllll\nll l l\nll l l\nllllll\n l  l\n l  l\n    ", "\nllllll\nll l l\nll l l\nllllll\nll  ll\n    "];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 50
};
var rockSpawns;
var nextRockSpawnDist;
var rocks;
var player;
var shots;
var lx;
var multiplier;
function update() {
  if (!ticks) {
    rockSpawns = [];
    nextRockSpawnDist = 0;
    rocks = [];
    player = {
      pos: vec(10, 87),
      vx: 0,
      shotTicks: 0
    };
    shots = [];
    lx = 50;
    multiplier = 1;
  }
  var scr = difficulty * 0.1;
  if (player.pos.x > 30) {
    scr += (player.pos.x - 30) * 0.05;
  }
  lx = wrap(lx - scr, 0, 99);
  color("light_black");
  rect(0, 90, 100, 10);
  color("white");
  rect(lx, 90, 1, 10);
  player.shotTicks--;
  if (input.isPressed) {
    if (input.isJustPressed) {
      multiplier = 1;
      player.vx = 0;
    }
    if (player.shotTicks < 0) {
      play("laser");
      shots.push({
        pos: vec(player.pos),
        vy: -2 * difficulty
      });
      player.shotTicks = 10 / difficulty;
    }
  } else if (input.isJustReleased) {
    play("select");
    player.vx = difficulty * 1.2;
  }
  player.pos.x += player.vx - scr;
  color("black");
  remove(shots, function (s) {
    s.pos.x -= scr;
    s.pos.y += s.vy;
    box(s.pos, 5, 9);
    return s.pos.y < 0;
  });
  nextRockSpawnDist -= scr;
  if (nextRockSpawnDist < 0) {
    var size = rnd(5, 15);
    var interval = rnd(10, 50) / difficulty;
    var speed = rnd(5, 10) / sqrt(size) * sqrt(difficulty);
    interval /= sqrt(speed) / sqrt(size);
    rockSpawns.push({
      x: 200,
      size: size,
      speed: speed,
      interval: interval,
      intervalVariation: rnd(0.3, 0.9),
      ticks: rnd(interval)
    });
    nextRockSpawnDist += rnd(50, 60);
  }
  remove(rockSpawns, function (r) {
    r.x -= scr;
    r.ticks--;
    if (r.ticks < 0) {
      rocks.push({
        pos: vec(r.x, -r.size / 2),
        vy: 0,
        size: r.size,
        speed: r.speed
      });
      r.ticks = r.interval * (1 + rnds(r.intervalVariation));
    }
    return r.x < 0;
  });
  color("red");
  remove(rocks, function (r) {
    r.vy += r.speed * 0.01;
    r.pos.x -= scr;
    r.pos.y += r.vy;
    if (box(r.pos, r.size).isColliding.rect.black) {
      r.size *= 0.7;
      color("black");
      particle(r.pos, 5, 3, PI / 2, 0.5);
      color("red");
      if (r.size < 5) {
        play("powerUp");
        addScore(multiplier * 10, r.pos.x, clamp(r.pos.y, 20, 99));
        particle(r.pos, 19, 3);
        return true;
      } else {
        play("hit");
        addScore(multiplier, r.pos.x, clamp(r.pos.y, 20, 99));
        multiplier++;
      }
    }
    if (r.pos.y > 90 - r.size / 2) {
      particle(r.pos, r.size * 0.3, sqrt(r.size) * 0.3);
      return true;
    }
  });
  color("black");
  if (char(input.isPressed ? "b" : addWithCharCode("a", floor(ticks / 20) % 2), player.pos).isColliding.rect.red || player.pos.x < -2) {
    play("explosion");
    end();
  }
  color("transparent");
  remove(shots, function (s) {
    return box(s.pos, 5, 9).isColliding.rect.red;
  });
}

