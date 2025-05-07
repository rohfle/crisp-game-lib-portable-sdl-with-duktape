title = "ROTATING TUNNEL";
description = "\n[Hold] Move outward\n[Release] Move inward\n";
characters = [];
options = {
  theme: "shape",
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 70
};
var ship;
var scoreAddingTicks;
var multiplier;
var obstacles;
var nextObstacleTicks;
var TUNNEL_CENTER_X = 50;
var TUNNEL_CENTER_Y = 50;
var TUNNEL_INNER_RADIUS = 10;
var TUNNEL_OUTER_RADIUS = 50;
var SHIP_MOVE_SPEED = 0.65;
var OBSTACLE_MOVE_SPEED = 0.25;
var OBSTACLE_SPAWN_INTERVAL = 80;
function update() {
  if (!ticks) {
    ship = {
      pos: vec(TUNNEL_CENTER_X, TUNNEL_CENTER_Y),
      angle: 0,
      radius: 20
    };
    scoreAddingTicks = 0;
    multiplier = 0;
    obstacles = [];
    nextObstacleTicks = 0;
  }
  var sd = sqrt(difficulty);
  ship.angle += 0.025 * sd;
  if (input.isJustPressed) {
    play("click");
  }
  if (input.isPressed) {
    ship.radius = clamp(ship.radius + SHIP_MOVE_SPEED, TUNNEL_INNER_RADIUS, TUNNEL_OUTER_RADIUS);
  } else {
    ship.radius = clamp(ship.radius - SHIP_MOVE_SPEED, TUNNEL_INNER_RADIUS, TUNNEL_OUTER_RADIUS);
  }
  ship.pos = vec(TUNNEL_CENTER_X + ship.radius * Math.cos(ship.angle), TUNNEL_CENTER_Y + ship.radius * Math.sin(ship.angle));
  nextObstacleTicks -= sd;
  if (nextObstacleTicks < 0) {
    var isGold = rnd() < 0.3;
    play(isGold ? "coin" : "laser");
    obstacles.push({
      radius: TUNNEL_OUTER_RADIUS,
      gapStart: rnd(0, 2 * PI),
      gapSize: rnd(PI / 4, PI / 3),
      isGold: isGold
    });
    nextObstacleTicks += OBSTACLE_SPAWN_INTERVAL;
  }
  remove(obstacles, function (o) {
    o.radius -= OBSTACLE_MOVE_SPEED * sd;
    return o.radius <= TUNNEL_INNER_RADIUS;
  });
  color("blue");
  arc(vec(TUNNEL_CENTER_X, TUNNEL_CENTER_Y), TUNNEL_OUTER_RADIUS);
  color("light_blue");
  arc(vec(TUNNEL_CENTER_X, TUNNEL_CENTER_Y), TUNNEL_INNER_RADIUS);
  color("cyan");
  var shipSize = 1;
  var shipPoints = [vec(ship.pos.x - shipSize * Math.cos(ship.angle), ship.pos.y - shipSize * Math.sin(ship.angle)), vec(ship.pos.x + shipSize * Math.cos(ship.angle), ship.pos.y + shipSize * Math.sin(ship.angle)), vec(ship.pos.x - shipSize * Math.sin(ship.angle), ship.pos.y + shipSize * Math.cos(ship.angle))];
  line(shipPoints[0], shipPoints[1]);
  line(shipPoints[1], shipPoints[2]);
  line(shipPoints[2], shipPoints[0]);
  obstacles.forEach(function (o) {
    var startAngle = o.gapStart;
    var endAngle = o.gapStart + o.gapSize;
    color(o.isGold ? "yellow" : "purple");
    if (arc(vec(TUNNEL_CENTER_X, TUNNEL_CENTER_Y), o.radius, 3, startAngle, endAngle).isColliding.rect.cyan) {
      if (o.isGold) {
        scoreAddingTicks -= sd;
        if (scoreAddingTicks < 0) {
          play("powerUp");
          multiplier++;
          addScore(ceil(multiplier), ship.pos);
          scoreAddingTicks += 5;
        }
      } else {
        play("explosion");
        end();
      }
    }
  });
  multiplier *= 0.99;
}

