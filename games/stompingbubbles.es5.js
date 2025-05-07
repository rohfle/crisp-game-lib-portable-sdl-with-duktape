title = "\nSTOMPING\nBUBBLES\n";
description = "\n[Hold] Stomp\n";
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 5
};
var player;
var playerSize = 5;
var playerSpeed = 1.5;
var bubbles;
var nextBubbleTicks;
var chainReactions;
var multiplier;
var minBubbleSize = 5;
var maxBubbleSize = 9;
var minBubbleSpeed = 0.1;
var maxBubbleSpeed = 0.3;
function update() {
  if (!ticks) {
    player = {
      pos: vec(50, 0),
      vy: 0
    };
    bubbles = [];
    nextBubbleTicks = 0;
    chainReactions = [];
    multiplier = 1;
  }
  var sd = sqrt(difficulty);
  player.pos.x += playerSpeed * sd;
  if (player.pos.x > 95 && playerSpeed > 0 || player.pos.x < 5 && playerSpeed < 0) {
    playerSpeed *= -1;
  }
  player.pos.y += player.vy * sd;
  player.vy += 0.01 * (input.isPressed ? 9 : 1);
  player.vy *= 0.99;
  if (player.pos.y < 0 && player.vy < 0) {
    player.vy *= -0.5;
  }
  if (player.pos.y > 99) {
    play("explosion");
    end();
  }
  if (input.isJustPressed) {
    play("select");
  }
  nextBubbleTicks -= sd;
  if (nextBubbleTicks < 0) {
    var size = rnd(minBubbleSize, maxBubbleSize);
    bubbles.push({
      pos: vec(rnd(0, 100), 102 + size),
      size: size,
      speed: rnd(minBubbleSpeed, maxBubbleSpeed)
    });
    nextBubbleTicks += 9;
  }
  bubbles.forEach(function (b) {
    b.pos.y -= b.speed * sd;
  });
  chainReactions.forEach(function (cr) {
    cr.size += sd;
    cr.duration -= sd;
  });
  remove(chainReactions, function (cr) {
    return cr.duration <= 0;
  });
  color("red");
  box(player.pos, playerSize);
  color("yellow");
  chainReactions.forEach(function (reaction) {
    arc(reaction.pos, reaction.size);
  });
  color("cyan");
  var isHit = false;
  remove(bubbles, function (bubble) {
    var c = arc(bubble.pos, bubble.size).isColliding.rect;
    if (c.red || c.yellow) {
      play("powerUp");
      particle(bubble.pos, {
        count: bubble.size * 2,
        speed: 3
      });
      addScore(multiplier, bubble.pos);
      multiplier++;
      chainReactions.push({
        pos: vec(bubble.pos),
        size: bubble.size,
        duration: 5
      });
      if (c.red && !isHit) {
        player.vy *= -1;
        player.pos.y += player.vy * 2;
        isHit = true;
      }
      return true;
    }
    return bubble.pos.y < -bubble.size;
  });
  if (chainReactions.length === 0) {
    multiplier = 1;
  }
}

