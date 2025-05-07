title = "KNIGHT\n  VS.\nPAWNS\n";
description = "\n[Tap] Move knight\n";
characters = ["\n  ll\n llll\nlllll\n  lll\n\n lllll\n  ", "\n  ll\n llll\nllllll\nllllll\n llll\n  ll\n", "\n  ll\n  ll\n \n llll\n  ll\nllllll\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  audioSeed: 2
};
var G = {
  WIDTH: 100,
  HEIGHT: 100,
  BOARD_SIZE: 8,
  SQUARE_SIZE: 10
};
var knight;
var ghostKnight;
var pawns;
var moveInterval;
var pawnInterval;
var spawnInterval;
var VALID_MOVES = [{
  x: 1,
  y: -2
}, {
  x: 2,
  y: -1
}, {
  x: 2,
  y: 1
}, {
  x: 1,
  y: 2
}, {
  x: -1,
  y: 2
}, {
  x: -2,
  y: 1
}, {
  x: -2,
  y: -1
}, {
  x: -1,
  y: -2
}];
function update() {
  if (!ticks) {
    knight = {
      pos: vec(3, 7)
    };
    ghostKnight = {
      pos: vec(5, 6),
      moveIndex: 0
    };
    pawns = [];
    moveInterval = 0;
    pawnInterval = 0;
    spawnInterval = 0;
  }
  for (var i = 0; i < G.BOARD_SIZE; i++) {
    for (var j = 0; j < G.BOARD_SIZE; j++) {
      color((i + j) % 2 === 0 ? "light_black" : "white");
      rect(i * G.SQUARE_SIZE + 10, j * G.SQUARE_SIZE + 10, G.SQUARE_SIZE, G.SQUARE_SIZE);
    }
  }
  moveInterval--;
  if (moveInterval <= 0) {
    moveGhostKnight();
    moveInterval = 30 / difficulty;
  }
  color("blue");
  char("b", ghostKnight.pos.x * G.SQUARE_SIZE + 15, ghostKnight.pos.y * G.SQUARE_SIZE + 15);
  if (input.isJustPressed) {
    play("laser");
    knight.pos = vec(ghostKnight.pos);
    moveGhostKnight();
    addScore(G.BOARD_SIZE - knight.pos.y, knight.pos.x * G.SQUARE_SIZE + 15, knight.pos.y * G.SQUARE_SIZE + 15);
  }
  color("blue");
  char("a", knight.pos.x * G.SQUARE_SIZE + 15, knight.pos.y * G.SQUARE_SIZE + 15);
  pawnInterval--;
  if (pawnInterval <= 0) {
    movePawns();
    pawnInterval = 60 / difficulty;
  }
  spawnInterval--;
  if (spawnInterval <= 0) {
    spawnPawn();
    spawnInterval = 120 / difficulty;
  }
  color("red");
  pawns.forEach(function (p) {
    char("c", p.pos.x * G.SQUARE_SIZE + 15, p.pos.y * G.SQUARE_SIZE + 15);
  });
  pawns.forEach(function (p) {
    if (p.pos.x === knight.pos.x && p.pos.y === knight.pos.y) {
      play("explosion");
      end();
    }
  });
  remove(pawns, function (p) {
    return p.pos.y >= G.BOARD_SIZE;
  });
}
function isValidMove(pos) {
  return pos.x >= 0 && pos.x < G.BOARD_SIZE && pos.y >= 0 && pos.y < G.BOARD_SIZE;
}
function moveGhostKnight() {
  var newPos;
  do {
    newPos = vec(knight.pos).add(VALID_MOVES[ghostKnight.moveIndex]);
    ghostKnight.moveIndex = (ghostKnight.moveIndex + 1) % VALID_MOVES.length;
  } while (!isValidMove(newPos));
  ghostKnight.pos = newPos;
}
function movePawns() {
  pawns.forEach(function (p) {
    p.pos.y++;
  });
}
function spawnPawn() {
  var x = Math.floor(rnd(0, G.BOARD_SIZE));
  pawns.push({
    pos: vec(x, 0)
  });
}

