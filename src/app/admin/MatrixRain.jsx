'use client';

import { useEffect, useRef } from 'react';

const GLYPHS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789<>/{}[]=+*ADNANZEROS';
const FONT_SIZE = 16;
const FRAME_MS = 45;
const FALLBACK = ['#81adea', '#e0dcf3', '#eeaa93'];

// Colors come from --mx-blue / --mx-lavender / --mx-peach in matrix.css,
// so changing the palette there changes the rain too.
function readPalette(element) {
  const style = getComputedStyle(element);
  return ['--mx-blue', '--mx-lavender', '--mx-peach'].map(
    (name, index) => style.getPropertyValue(name).trim() || FALLBACK[index],
  );
}

// Most columns blue, some lavender, a few peach.
function pickTone() {
  const roll = Math.random();
  if (roll < 0.72) return 0;
  if (roll < 0.92) return 1;
  return 2;
}

export default function MatrixRain({ dim = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const palette = readPalette(canvas);
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let columns = [];
    let width = 0;
    let height = 0;
    let frameId = 0;
    let lastTime = 0;

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#03060b';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${FONT_SIZE}px ui-monospace, Menlo, Consolas, monospace`;
      ctx.textBaseline = 'top';

      const count = Math.ceil(width / FONT_SIZE);
      columns = Array.from({ length: count }, () => ({
        y: Math.floor(Math.random() * (height / FONT_SIZE)) * -1,
        tone: pickTone(),
      }));
    };

    const step = () => {
      ctx.fillStyle = 'rgba(3, 6, 11, 0.1)';
      ctx.fillRect(0, 0, width, height);

      columns.forEach((column, index) => {
        const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const x = index * FONT_SIZE;
        const y = column.y * FONT_SIZE;

        // Bright head, then the trail fades by itself.
        ctx.fillStyle = palette[column.tone];
        ctx.fillText(glyph, x, y);

        if (y > height && Math.random() > 0.972) {
          column.y = 0;
          column.tone = pickTone();
        } else {
          column.y += 1;
        }
      });
    };

    const loop = time => {
      frameId = window.requestAnimationFrame(loop);
      if (document.hidden || time - lastTime < FRAME_MS) return;
      lastTime = time;
      step();
    };

    setup();
    if (reduceMotion) {
      // One still picture, no animation.
      for (let i = 0; i < 40; i += 1) step();
    } else {
      frameId = window.requestAnimationFrame(loop);
    }

    window.addEventListener('resize', setup);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', setup);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`mx-rain${dim ? ' mx-rain-dim' : ''}`}
      aria-hidden="true"
    />
  );
}
