title = "GRAPPLING H";
description = "\n[Tap]\n Release hook\n Hold anchor\n";
options = {
  viewSize: {
    x: 100,
    y: 150
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 9
};
var player;
var playerRadius = 4;
var anchorPoints;
var anchorRadius = 1;
var scrolledDistanceY;
var nextAnchorDistance = 20;
var scrolledDistanceYForScore;
var inputIsReleased;
var inputIsJustPressed;
function update() {
  if (!ticks) {
    anchorPoints = [vec(50, 0)];
    player = {
      pos: vec(30, 30),
      vel: vec(),
      attachedAnchor: anchorPoints[0]
    };
    scrolledDistanceY = 0;
    inputIsReleased = false;
    inputIsJustPressed = false;
  }
  inputIsJustPressed = input.isJustPressed;
  var scrollY = 0.1 * difficulty;
  if (player.pos.y < 75) {
    scrollY += (75 - player.pos.y) * 0.1;
  }
  scrolledDistanceY += scrollY;
  scrolledDistanceYForScore += scrollY;
  while (scrolledDistanceY > nextAnchorDistance) {
    scrolledDistanceY -= nextAnchorDistance;
    anchorPoints.push(vec(rnd(10, 90), -5 + scrolledDistanceY));
  }
  var attachableAnchor = null;
  var attachableDist = 25;
  anchorPoints.forEach(function (a) {
    var dist = player.pos.distanceTo(a);
    if (player.attachedAnchor == null && dist < attachableDist) {
      attachableAnchor = a;
      attachableDist = dist;
    }
  });
  remove(anchorPoints, function (a) {
    a.y += scrollY;
    color(a === attachableAnchor ? "red" : "black");
    arc(a, anchorRadius).isColliding;
    if (a === attachableAnchor) {
      color("red");
      line(player.pos, a, 1);
      if (inputIsReleased && input.isPressed) {
        play("coin");
        player.attachedAnchor = a;
        if (scrolledDistanceYForScore > 0) {
          addScore(ceil(sqrt(scrolledDistanceYForScore * scrolledDistanceYForScore) * 0.1), a);
        }
        inputIsJustPressed = false;
      }
    }
    return a.y > 155;
  });
  color("blue");
  player.pos.add(player.vel);
  player.vel.mul(1 - abs(player.vel.length) * 0.001);
  player.vel.y += 0.1;
  player.pos.y += scrollY;
  if (player.pos.x < 0 && player.vel.x < 0 || player.pos.x > 100 && player.vel.x > 0) {
    play("hit");
    player.vel.x *= -0.8;
  }
  if (player.attachedAnchor != null) {
    if (player.attachedAnchor.y > 150) {
      play("explosion");
      end();
    }
    var dist = player.pos.distanceTo(player.attachedAnchor);
    var angle = player.pos.angleTo(player.attachedAnchor);
    var force = dist;
    player.vel.addWithAngle(angle, force * 0.01);
    line(player.pos, player.attachedAnchor, 2);
    if (inputIsJustPressed) {
      play("jump");
      player.attachedAnchor.set(0, 999);
      player.attachedAnchor = null;
      player.vel.addWithAngle(angle, force * 0.2);
      scrolledDistanceYForScore = 0;
      inputIsReleased = false;
    }
  } else {
    if (player.pos.y > 150 && player.vel.y > 0) {
      play("explosion");
      end();
    }
  }
  arc(player.pos, playerRadius, 2).isColliding;
  if (input.isJustReleased) {
    inputIsReleased = true;
  }
}

