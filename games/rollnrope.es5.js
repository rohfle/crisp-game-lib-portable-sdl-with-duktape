title = "ROLLNROPE";
description = "\n[Tap] Jump / Run\n";
characters = ["\n  llll\n  llll\n  llll\n  ll\nllllll\nllllll\n", "\n lll\n  lll\n   ll\n  ll \n  ll\n ll \n", "\n  lll\n  l ll\n ll ll\n ll ll\nll  ll\nll ll\n"];
options = {
  theme: "shape",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 9
};
var rope;
var player;
function update() {
  if (!ticks) {
    rope = undefined;
    player = {
      pos: vec(5, 84),
      vy: 0,
      mode: "stop"
    };
  }
  if (!rope) {
    rope = {
      x: 150,
      angle: rnd(PI * 2),
      radius: rnd(30, 45),
      size: rnd(5, 10),
      speed: rnd(1, 2) * difficulty,
      count: !ticks ? 2 : rndi(2, 6)
    };
    if (rnd() < 0.2) {
      rope.speed *= -1;
    }
  }
  rect(0, 90, 99, 9);
  rope.x -= (rope.x - 50) * 0.1;
  var pa = wrap(rope.angle - PI / 2, -PI, PI);
  rope.angle += rope.speed * 0.05;
  var a = wrap(rope.angle - PI / 2, -PI, PI);
  var ry = 91 - rope.size / 2 - rope.radius + sin(rope.angle) * rope.radius;
  box(rope.x + cos(rope.angle) * rope.radius, ry, rope.size, rope.size);
  text("".concat(rope.count), 50, 10);
  if (pa * a < 0 && abs(a) < PI / 2) {
    if (player.mode === "jump") {
      play("powerUp");
      rope.count--;
      var s = 85 - rope.size - player.pos.y;
      if (s < 0) {
        s = 1;
      }
      s = floor(100 / s);
      addScore(s, player.pos);
      if (rope.count === 0) {
        play("coin");
        rope = undefined;
        player.mode = "stop";
      }
    } else {
      play("hit");
    }
  }
  if (player.mode === "stop") {
    player.pos.x += (5 - player.pos.x) * 0.1;
    if (player.pos.y === 84 && input.isJustPressed) {
      play("select");
      player.mode = "run";
    }
  }
  if (player.mode === "run") {
    player.pos.x += difficulty * 2;
    if (player.pos.x > 50) {
      player.pos.x = 50;
      player.mode = "stand";
    }
  }
  if (player.mode === "stand") {
    if (input.isPressed) {
      play("jump");
      player.vy = -3;
      player.mode = "jump";
    }
  }
  if (player.mode === "jump" || player.mode === "stop") {
    player.vy += (input.isPressed ? 0.1 : 0.2) * sqrt(difficulty);
    player.pos.y += player.vy;
    if (player.pos.y > 84) {
      player.pos.y = 84;
      if (player.mode === "jump") {
        player.mode = "stand";
      }
    }
  }
  var c1 = char("a", player.pos.x, player.pos.y - 3).isColliding.rect.black;
  var c2 = char(player.mode === "jump" || player.mode === "run" ? "c" : "b", player.pos.x, player.pos.y + 3).isColliding.rect.black;
  if (c1 || c2) {
    play("explosion");
    end();
  }
}

