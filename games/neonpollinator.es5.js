title = "NEON POLLINATOR";
description = "\n[Hold] Glow & Rise\n";
characters = [];
options = {
  theme: "shapeDark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 2
};
var player;
var flowers;
var nextFlowerDist;
var energyOrbs;
var nextOrbDist;
var gardenScrollSpeed;
var multiplier;
function update() {
  if (!ticks) {
    player = {
      pos: vec(20, 50),
      energy: 100,
      glowRadius: 5
    };
    flowers = [];
    nextFlowerDist = 0;
    energyOrbs = [];
    nextOrbDist = 0;
    gardenScrollSpeed = 1;
    multiplier = 1;
  }
  gardenScrollSpeed = difficulty * 0.5;
  if (input.isJustPressed) {
    multiplier = 1;
    play(player.energy > 0 ? "laser" : "hit");
  }
  if (input.isPressed && player.energy > 0) {
    player.glowRadius = Math.min(player.glowRadius + 0.25 * difficulty, 25);
    player.pos.y -= difficulty;
    player.energy -= 0.5 * difficulty;
  } else {
    player.glowRadius = Math.max(player.glowRadius - 0.5 * difficulty, 3);
    player.pos.y += 0.7 * difficulty;
    player.energy -= 0.1 * difficulty;
  }
  player.energy = clamp(player.energy, 0, 100);
  if (player.glowRadius > 3) {
    color("yellow");
    arc(player.pos, player.glowRadius);
  }
  color("cyan");
  arc(player.pos, 3);
  if (player.pos.y < 0 || player.pos.y > 100) {
    play("explosion");
    end();
  }
  nextFlowerDist -= gardenScrollSpeed;
  if (nextFlowerDist < 0) {
    flowers.push({
      pos: vec(115, rnd(10, 90)),
      size: rnd(5, 15),
      isPollinated: false,
      glowRadius: 0
    });
    nextFlowerDist += 20;
  }
  remove(flowers, function (f) {
    f.pos.x -= gardenScrollSpeed;
    return f.pos.x < -10;
  });
  flowers.forEach(function (f) {
    if (f.isPollinated && f.glowRadius > 0) {
      color("yellow");
      arc(f.pos, f.glowRadius, 1);
    }
  });
  flowers.forEach(function (f) {
    color(f.isPollinated ? "yellow" : "light_purple");
    if (arc(f.pos, f.size).isColliding.rect.yellow && !f.isPollinated) {
      f.isPollinated = true;
      f.glowRadius = f.size * 3;
      play("select");
      addScore(multiplier, f.pos);
      multiplier++;
    }
    if (f.isPollinated) {
      f.glowRadius = Math.max(f.glowRadius - 0.2 * difficulty, 0);
    }
  });
  nextOrbDist -= gardenScrollSpeed;
  if (nextOrbDist < 0) {
    energyOrbs.push({
      pos: vec(100, rnd(10, 90))
    });
    nextOrbDist += rnd(16, 20);
  }
  remove(energyOrbs, function (o) {
    var isVisible = false;
    flowers.forEach(function (f) {
      if (f.isPollinated && o.pos.distanceTo(f.pos) < f.glowRadius) {
        isVisible = true;
      }
    });
    if (o.pos.distanceTo(player.pos) < player.glowRadius) {
      isVisible = true;
    }
    color(isVisible ? "cyan" : "transparent");
    if (box(o.pos, 5).isColliding.rect.cyan) {
      player.energy = Math.min(player.energy + 20, 100);
      color("cyan");
      particle(o.pos, {
        speed: 2
      });
      play("coin");
      return true;
    }
    o.pos.x -= gardenScrollSpeed;
    return o.pos.x < -10;
  });
  color("light_yellow");
  rect(0, 97, player.energy, 3);
  color(player.energy < 30 ? ticks % 20 < 10 ? "red" : "transparent" : "light_black");
  rect(player.energy, 97, 100 - player.energy, 3);
}

