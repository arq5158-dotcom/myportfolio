'use client';

import { useEffect, useRef } from 'react';

type Node = { x: number; y: number; vx: number; vy: number; r: number };

const LINK = 168; // px within which two nodes draw an edge
const REACH = 230; // cursor influence radius

/**
 * The hero backdrop: a drifting constellation that wakes up around the cursor.
 * Canvas 2D on purpose — a WebGL dependency buys nothing at this node count.
 */
export default function NeuralField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    const mouse = { x: -9999, y: -9999 };

    const build = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const n = Math.min(150, Math.round((w * h) / 9000));
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.4 + 0.6,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // ponytail: O(n^2) pair scan — fine to ~150 nodes; grid-bucket it if that grows
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];

        if (!still) {
          a.x += a.vx;
          a.y += a.vy;
          if (a.x < 0 || a.x > w) a.vx *= -1;
          if (a.y < 0 || a.y > h) a.vy *= -1;
        }

        const mdx = a.x - mouse.x;
        const mdy = a.y - mouse.y;
        const md = Math.hypot(mdx, mdy);
        const lit = md < REACH ? 1 - md / REACH : 0;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > LINK) continue;
          const near = 1 - d / LINK;
          const bd = Math.hypot(b.x - mouse.x, b.y - mouse.y);
          const heat = Math.max(lit, bd < REACH ? 1 - bd / REACH : 0);
          ctx.strokeStyle = heat
            ? `rgba(216, 255, 62, ${near * heat * 0.5})`
            : `rgba(242, 239, 231, ${near * 0.12})`;
          ctx.lineWidth = heat > 0.55 ? 0.75 : 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        ctx.fillStyle = lit
          ? `rgba(216, 255, 62, ${0.28 + lit * 0.72})`
          : 'rgba(242, 239, 231, 0.42)';
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r + lit * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let raf = 0;
    let running = false;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    const run = (on: boolean) => {
      if (on === running) return;
      running = on;
      if (on) raf = requestAnimationFrame(loop);
      else cancelAnimationFrame(raf);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };

    build();
    draw();

    if (!still) {
      // only burn frames while the hero is actually on screen
      const io = new IntersectionObserver(([e]) => run(e.isIntersecting), {
        threshold: 0,
      });
      io.observe(canvas);
      const vis = () => run(!document.hidden);
      const ro = new ResizeObserver(() => {
        build();
        draw();
      });
      ro.observe(canvas);
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('visibilitychange', vis);
      return () => {
        run(false);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener('pointermove', onMove);
        document.removeEventListener('visibilitychange', vis);
      };
    }

    const ro = new ResizeObserver(() => {
      build();
      draw();
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ opacity: 1 }}
    />
  );
}
