function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
title = "FRACAVE";
description = "\n[Hold]\n Accelerate\n";
options = {
  viewSize: {
    x: 100,
    y: 150
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 5
};
var player;
var walls;
var wallSpeed;
var wallInterval;
function update() {
  if (!ticks) {
    player = {
      pos: vec(40, 75),
      angle: 0,
      speed: 1,
      noReflectionDistance: 0
    };
    walls = [].concat(_toConsumableArray(generateFractalWall(20, 0, 20, 150, 3)), _toConsumableArray(generateFractalWall(80, 0, 80, 150, 3)));
    wallSpeed = 1;
    wallInterval = 150;
  }
  wallInterval += wallSpeed;
  if (wallInterval >= 150) {
    var _walls;
    wallInterval = 0;
    var leftWalls = generateFractalWall(20, -150, 20, 0, 3);
    var rightWalls = generateFractalWall(80, -150, 80, 0, 3);
    (_walls = walls).push.apply(_walls, _toConsumableArray(leftWalls).concat(_toConsumableArray(rightWalls)));
  }
  if (input.isJustPressed) {
    play("click");
  }
  if (input.isPressed) {
    player.speed += (2 - player.speed) * 0.3;
  } else {
    player.speed += (0.1 - player.speed) * 0.3;
  }
  player.pos.addWithAngle(player.angle, player.speed * difficulty);
  player.noReflectionDistance -= player.speed * difficulty;
  walls.forEach(function (wall) {
    wall.y1 += wallSpeed;
    wall.y2 += wallSpeed;
  });
  color("cyan");
  bar(player.pos, 7, 3, player.angle);
  color("black");
  walls.forEach(function (wall) {
    if (line(wall.x1, wall.y1, wall.x2, wall.y2).isColliding.rect.cyan && player.noReflectionDistance < 0) {
      var wallVector = vec(wall.x2 - wall.x1, wall.y2 - wall.y1);
      var wallNormal = vec(-wallVector.y, wallVector.x).normalize();
      var playerVector = vec(Math.cos(player.angle), Math.sin(player.angle));
      var dot = playerVector.x * wallNormal.x + playerVector.y * wallNormal.y;
      var reflectVector = vec(playerVector.x - 2 * dot * wallNormal.x, playerVector.y - 2 * dot * wallNormal.y);
      player.angle = Math.atan2(reflectVector.y, reflectVector.x);
      player.speed = 0.2;
      addScore(1, player.pos);
      player.pos.addWithAngle(player.angle, 7);
      play("hit");
      player.noReflectionDistance = 9;
    }
  });
  if (!player.pos.isInRect(0, 0, 100, 150)) {
    play("explosion");
    end();
  }
  wallSpeed = difficulty;
  walls = walls.filter(function (wall) {
    return wall.y1 < 170;
  });
  function generateFractalWall(x1, y1, x2, y2, depth) {
    if (depth === 0) {
      return [{
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2
      }];
    }
    var midX = (x1 + x2) / 2;
    var midY = (y1 + y2) / 2;
    var offsetX = rnds(10);
    var offsetY = rnds(5);
    return [].concat(_toConsumableArray(generateFractalWall(x1, y1, midX + offsetX, midY + offsetY, depth - 1)), _toConsumableArray(generateFractalWall(midX + offsetX, midY + offsetY, x2, y2, depth - 1)));
  }
}

