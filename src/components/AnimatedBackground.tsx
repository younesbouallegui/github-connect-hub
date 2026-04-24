import { useEffect, useRef } from "react";

/**
 * Animated background: grid + subtle particle flow + gradient glow.
 * Sits behind everything via fixed positioning.
 */
export const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const particles = Array.from({ length: 38 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00025,
      vy: (Math.random() - 0.5) * 0.00025,
      r: Math.random() * 1.4 + 0.4,
      a: Math.random() * 0.5 + 0.2,
    }));

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      // Connections
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = (p.x - q.x) * w;
          const dy = (p.y - q.y) * h;
          const d = Math.hypot(dx, dy);
          if (d < 140) {
            ctx.strokeStyle = `hsla(188, 90%, 60%, ${0.12 * (1 - d / 140)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x * w, p.y * h);
            ctx.lineTo(q.x * w, q.y * h);
            ctx.stroke();
          }
        }
      }

      // Particles
      for (const p of particles) {
        ctx.fillStyle = `hsla(188, 95%, 65%, ${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid opacity-60" aria-hidden />
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -top-40 left-1/2 z-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(188 92% 45% / 0.35), transparent 70%)" }}
        aria-hidden
      />
    </>
  );
};
