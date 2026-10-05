(() => {
  const canvas = document.getElementById('space');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const stars = [];
  const rings = [];

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function seed() {
    stars.length = 0; rings.length = 0;
    const count = Math.min(650, Math.max(220, Math.floor(w * h / 3500)));
    for (let i = 0; i < count; i++) stars.push({ x: Math.random()*w, y: Math.random()*h, z: Math.random(), s: Math.random()*1.7+.2, a: Math.random()*.8+.15 });
    for (let i = 0; i < 12; i++) rings.push({ r: Math.random()*280+100, a: Math.random()*Math.PI*2, speed: (Math.random()-.5)*.002, alpha: Math.random()*.22+.05 });
  }
  function draw(t=0) {
    ctx.clearRect(0,0,w,h);
    const g = ctx.createRadialGradient(w*.5,h*.43,20,w*.5,h*.43,Math.max(w,h)*.7);
    g.addColorStop(0,'rgba(95,5,45,.18)'); g.addColorStop(1,'rgba(2,1,7,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    if (!reduceMotion) {
      pointer.x += (pointer.tx-pointer.x)*.035;
      pointer.y += (pointer.ty-pointer.y)*.035;
    }
    for (const s of stars) {
      const px = s.x + pointer.x*s.z*20, py = s.y + pointer.y*s.z*12;
      const tw = reduceMotion ? 1 : .65 + Math.sin(t*.001*s.z + s.x)*.35;
      ctx.fillStyle = `rgba(255,${90+Math.floor(s.z*100)},${180+Math.floor(s.z*70)},${s.a*tw})`;
      ctx.beginPath(); ctx.arc(px,py,s.s*(.6+s.z),0,Math.PI*2); ctx.fill();
    }
    ctx.save(); ctx.translate(w/2+pointer.x*15,h*.43+pointer.y*10);
    for (const r of rings) { if (!reduceMotion) r.a += r.speed; ctx.rotate(r.a); ctx.strokeStyle=`rgba(255,55,145,${r.alpha})`; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(0,0,r.r,r.r*.27,0,0,Math.PI*2); ctx.stroke(); }
    ctx.restore();
    if (!reduceMotion) requestAnimationFrame(draw);
  }
  window.addEventListener('resize', () => { resize(); seed(); if (reduceMotion) draw(); });
  window.addEventListener('pointermove', e => { pointer.tx=(e.clientX/w-.5); pointer.ty=(e.clientY/h-.5); });
  resize(); seed(); draw();
  window.VenomWorld = { pointer };
})();
