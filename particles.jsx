/* Magical particle field - dust motes + rising embers + slow drifting glyphs */
/* Exposes <Particles /> on window */

const { useEffect, useRef } = React;

function Particles({ density = 70, color = "139, 92, 246", className = "particles" }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let parts = [];

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = Array.from({ length: density }, () => spawn(true));
    };
    const spawn = (initial = false) => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 20,
      r: Math.random() * 1.6 + 0.4,
      vy: -(Math.random() * 0.4 + 0.15),
      vx: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.6 + 0.15,
      phase: Math.random() * Math.PI * 2,
      twinkle: Math.random() * 0.02 + 0.008,
      hue: Math.random() < 0.15 ? "232, 200, 120" : color,
    });

    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const tick = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.x += p.vx + Math.sin((t + p.phase * 50) * 0.005) * 0.15;
        p.y += p.vy;
        p.a += Math.sin(t * p.twinkle + p.phase) * 0.005;
        if (p.y < -10 || p.x < -10 || p.x > w + 10) parts[i] = spawn(false);

        const alpha = Math.max(0, Math.min(0.9, p.a));
        ctx.beginPath();
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grd.addColorStop(0, `rgba(${p.hue}, ${alpha})`);
        grd.addColorStop(0.4, `rgba(${p.hue}, ${alpha * 0.4})`);
        grd.addColorStop(1, `rgba(${p.hue}, 0)`);
        ctx.fillStyle = grd;
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.hue}, ${Math.min(1, alpha + 0.3)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [density, color]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

window.Particles = Particles;
