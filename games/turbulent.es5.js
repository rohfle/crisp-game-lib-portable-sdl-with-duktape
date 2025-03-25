function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
title = "TURBULENT";
description = "\n[Tap] Jump\n";
characters = [];
options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 300
};
var waves;
var points;
var mines;
var nextMineDist;
var ship;
var jumpX;
function update() {
  if (!ticks) {
    waves = times(7, function (i) {
      return {
        height: rnd(10, 30),
        angle: i % 2 * PI + rnds(PI / 4),
        va: rnd(0.01, 0.02),
        x: i * 20 - 20
      };
    });
    points = times(25, function (i) {
      return vec();
    });
    mines = [];
    nextMineDist = 0;
    ship = {
      pos: vec(40, 60),
      pp: vec(40, 60),
      vel: vec(),
      angle: 0,
      state: "float"
    };
  }
  var scr = 0.1 * difficulty;
  if (ship.pos.x > 50) {
    scr += (ship.pos.x - 50) * 0.1;
  }
  waves.forEach(function (w, i) {
    w.x -= scr;
    if (w.x < -20) {
      w.x += 140;
      w.height = rnd(10, 30);
      w.angle = rnd(PI * 2);
      w.va = rnd(0.01, 0.02 * sqrt(difficulty));
    }
    w.angle += w.va;
    points[i * 4].set(w.x, 60 + sin(w.angle) * w.height);
  });
  color("blue");
  points.forEach(function (p, i) {
    var im = i % 4;
    if (im !== 0) {
      var _pp = points[floor(i / 4) * 4];
      var np = points[(floor(i / 4) + 1) * 4];
      var r = [0.2, 0.5, 0.8][im - 1];
      p.set(_pp.x + 5 * im, _pp.y * (1 - r) + np.y * r);
    }
    var pp = points[wrap(i - 1, 0, points.length)];
    if (pp.x < p.x) {
      line(pp, p);
    }
  });
  nextMineDist -= scr;
  if (nextMineDist < 0) {
    mines.push({
      x: 103,
      vx: 0
    });
    nextMineDist = rnd(100, 120) / sqrt(difficulty);
  }
  color("red");
  remove(mines, function (m) {
    m.x -= scr;
    var _getPoints = getPoints(m.x),
      _getPoints2 = _slicedToArray(_getPoints, 2),
      pp = _getPoints2[0],
      np = _getPoints2[1];
    if (np == null) {
      return true;
    }
    var oy = np.y - pp.y;
    m.vx += oy * 0.001;
    m.vx *= 0.9;
    m.x += m.vx * sqrt(difficulty);
    var r = (m.x - pp.x) / (np.x - pp.x);
    text("*", m.x, pp.y + oy * r - 5);
    return m.x < -3;
  });
  var sa;
  if (ship.state === "float") {
    var _getPoints3 = getPoints(ship.pos.x),
      _getPoints4 = _slicedToArray(_getPoints3, 2),
      pp = _getPoints4[0],
      np = _getPoints4[1];
    if (np != null) {
      var oy = np.y - pp.y;
      ship.vel.x += oy * 0.002;
      ship.vel.x *= 0.925;
      ship.vel.x += 0.025;
      ship.pos.x += ship.vel.x;
      var r = (ship.pos.x - pp.x) / (np.x - pp.x);
      ship.pos.y = pp.y + oy * r;
      sa = pp.angleTo(np);
    }
    if (input.isJustPressed) {
      play("jump");
      jumpX = ship.pos.x;
      ship.vel.x = (ship.pos.x - ship.pp.x) * 2;
      ship.vel.y = (ship.pos.y - ship.pp.y) * 5;
      ship.vel.addWithAngle(sa - PI / 2, 1);
      if (ship.vel.y > -1) {
        ship.vel.y = -1;
      }
      ship.pos.add(ship.vel);
      ship.state = "jump";
    }
  } else {
    jumpX -= scr;
    ship.vel.x += 0.005;
    ship.vel.y += input.isPressed ? 0.02 : 0.1;
    ship.vel.mul(0.98);
    ship.pos.add(ship.vel);
    sa = ship.vel.angle;
  }
  ship.pos.x -= scr;
  ship.pos.clamp(5, 95, 5, 95);
  ship.pp.set(ship.pos);
  ship.angle += wrap(sa - ship.angle, -PI, PI) * 0.1;
  sa = ship.angle;
  var p = vec(ship.pos);
  p.addWithAngle(sa - PI * 0.5, 2);
  color("red");
  bar(p, 3, 2, sa);
  p.addWithAngle(sa - PI * 0.4, 2);
  color("black");
  bar(p, 4, 2, sa);
  p.addWithAngle(sa - PI * 0.6, 2);
  var c = bar(p, 1, 2, sa).isColliding;
  if (ship.state === "jump" && c.rect.blue) {
    var d = ship.pos.x - jumpX;
    play("hit");
    if (d > 0) {
      play("powerUp");
      addScore(ceil(sqrt(d * d)), ship.pos);
    }
    ship.state = "float";
    ship.vel.x *= 0.5;
  }
  if (c.text["*"]) {
    play("explosion");
    end();
  }
  function getPoints(x) {
    var pp;
    var np;
    for (var i = 0; i < points.length; i++) {
      pp = points[wrap(i - 1, 0, points.length)];
      np = points[i];
      if (pp.x > np.x) {
        continue;
      }
      if (pp.x <= x && x < np.x) {
        return [pp, np];
      }
    }
    return [undefined, undefined];
  }
}

