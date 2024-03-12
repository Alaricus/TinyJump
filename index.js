const ctx = document.querySelector('canvas').getContext('2d');
document.querySelector('body').addEventListener('keydown', (e) => {
  if (e.code === 'ArrowLeft') { state.m.l = true; }
  if (e.code === 'ArrowRight') { state.m.r = true; }
  if (e.code === 'KeyR') { init(); }
});
document.querySelector('body').addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft') { state.m.l = false; }
  if (e.code === 'ArrowRight') { state.m.r = false; }
});
const score = document.querySelector('span');
let state = {};
const rectsIntersect = (a, b) => a.x <= b.x + b.w && b.x <= a.x + a.w && a.y <= b.y + b.h && b.y <= a.y + a.h;
const generatePlanks = () => {
  let highestPlankY = 810;
  state.planks = state.planks.filter(p => { if (p.y < highestPlankY) { highestPlankY = p.y; } return p.y <= 810; } );
  if (highestPlankY > 50 && state.planks.length < 20) {
    const randomPlank = { x: Math.floor((Math.random() * 450) + 25), y: Math.floor(Math.random() * highestPlankY), w: 100, h: 25, t: 'r' };
    if (
      !state.planks.some(p => rectsIntersect({ x: p.x - 25, y: p.y - 25, h: p.h + 50, w: p.w + 50}, randomPlank))
      && highestPlankY - randomPlank.y >= 100
      && highestPlankY - randomPlank.y <= 200
    ) {
      if (Math.random() * 100 > 89) { randomPlank.t = 's' }
      if (Math.random() * 100 < 10 && state.planks[state.planks.length - 1].t !== 'u') { randomPlank.t = 'u' }
      state.planks.push(randomPlank);
    }
  }
}
const update = () => {
  state.p.v += 0.3;
  state.p.y += state.p.v;
  if (state.m.l) { state.p.x -= 3; }
  if (state.m.r) { state.p.x += 3; }
  if (state.p.x < 0 - state.p.w / 2) { state.p.x = 600 - state.p.w / 2; }
  if (state.p.x > 600 - state.p.w / 2) { state.p.x = state.p.w / -2; }
  state.planks.forEach(p => {
    if (state.p.v >= 0 && state.p.y + state.p.h < p.y + p.h / 2 && rectsIntersect({ ...state.p }, { ...p })) {
      if (p.t === 'r') { state.p.v = -15; }
      if (p.t === 's') { state.p.v = -21; }
      if (p.t === 'u') { p.y = 900; }
    }
  });
  generatePlanks();
  if (state.p.y < 800 / 2 && state.p.v < 0) {
    state.planks.forEach(p => { p.y -= state.p.v; });
    state.p.y -= state.p.v;
    state.score += Math.floor((state.p.v * -1));
  }
  score.innerText = state.score;
  if (state.p.y + state.p.h > 800) { state.o = true; state.p.v = -15; }
};
const draw = () => {
  ctx.clearRect(0, 0, 600, 800);
  state.planks.forEach(p => {
    if (p.t === 'r') { ctx.fillStyle = '#3182ce'; }
    if (p.t === 's') {
      ctx.fillStyle = '#48bb78';
      ctx.fillRect(p.x + 33, p.y - 3, p.w - 66, p.h);
    }
    if (p.t === 'u') { ctx.fillStyle = '#ecc94b'; }
    ctx.fillRect(p.x, p.y, p.w, p.h);
    if (p.t === 'u') {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x + 33, p.y - 1);
      ctx.lineTo(p.x + 66, p.y + p.h + 1);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  });
  ctx.fillStyle = state.o ? '#f56565' : '#888888';
  ctx.fillRect(state.p.x, state.p.y, state.p.w, state.p.h);
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.font = '60px Arial';
  if (state.o) { ctx.fillText('Game Over', 300, 400); }
};

const main = () => {
  requestAnimationFrame(main);
  const msNow = window.performance.now()
  const msPassed = msNow - msPrev;
  if (msPassed < state.mpf) return;
  if (!state.o) { update(); draw(); }
  const excessTime = msPassed % state.mpf;
  msPrev = msNow - excessTime;
  state.f += 1;
};

const init = () => { state = {
  mpf: 1000/60, m: { l: false, r: false }, p: { h: 50, w: 50, x: 200, y: 750, v: -15 },
  f: 0, o: false, planks: [{ x: 200, y: 700, w: 100, h: 25, t: 'r' }], score: 0
};};

init();
let msPrev = window.performance.now();
main();



/*
  state
    mpf = millisecondsPerFrame
    m = movement
      l = left
      r = right
    p = player
      h = height
      w = width
      x = x coordinate
      y = y coordinate
      v = velocity
    f = frames
    o = over
    planks
      t = type (r = regular, s = spring, u = useless)
  */
