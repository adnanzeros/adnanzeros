'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function PortfolioEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const canHover = window.matchMedia(
      '(hover:hover) and (pointer:fine)',
    ).matches;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const context = gsap.context(() => {
      if (!reduceMotion) {
        document
          .querySelectorAll('.wrap:not(#about):not(#stack)')
          .forEach(section =>
            gsap.from(section, {
              opacity: 0,
              y: section.id === 'projects' ? 0 : 60,
              rotationX: section.id === 'projects' ? 0 : 14,
              z: -160,
              transformPerspective: 1200,
              transformOrigin: '50% 100%',
              duration: 1.1,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
              scrollTrigger: { trigger: section, start: 'top 92%', once: true },
            }),
          );
        gsap.utils
          .toArray('.wrap:not(#about):not(#stack) h2')
          .forEach(heading =>
            gsap.from(heading, {
              scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
              x: -30,
              opacity: 0,
              duration: 0.8,
              clearProps: 'transform,opacity',
            }),
          );
        gsap.from('#github .stats > *', {
          scrollTrigger: { trigger: '#github', start: 'top 78%', once: true },
          y: 50,
          opacity: 0,
          stagger: 0.15,
          duration: 0.9,
          clearProps: 'transform,opacity',
        });
        gsap.from('.foot > *', {
          scrollTrigger: { trigger: '.foot', start: 'top 97%', once: true },
          y: 20,
          opacity: 0,
          stagger: 0.08,
          duration: 0.6,
          clearProps: 'transform,opacity',
        });
        if (canHover) {
          gsap.to('.hero-text', {
            scrollTrigger: {
              trigger: '.hero',
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
            y: -28,
            ease: 'none',
          });
        }
        gsap.to('#bar', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { start: 0, end: 'max', scrub: true },
        });
      }
    }, document);

    let spotlightFrame = 0;
    let spotlightEvent;
    const updateSpotlight = () => {
      spotlightFrame = 0;
      const target = spotlightEvent?.target;
      if (!(target instanceof Element)) return;
      const element = target.closest('.tile, .card');
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      element.style.setProperty(
        '--ry',
        `${((spotlightEvent.clientX - bounds.left) / bounds.width - 0.5) * 12}deg`,
      );
      element.style.setProperty(
        '--rx',
        `${-((spotlightEvent.clientY - bounds.top) / bounds.height - 0.5) * 12}deg`,
      );
      element.style.setProperty(
        '--mx',
        `${spotlightEvent.clientX - bounds.left}px`,
      );
      element.style.setProperty(
        '--my',
        `${spotlightEvent.clientY - bounds.top}px`,
      );
    };
    const onPointerMove = event => {
      spotlightEvent = event;
      if (!spotlightFrame)
        spotlightFrame = requestAnimationFrame(updateSpotlight);
    };

    const resetTilt = event => {
      const element =
        event.target instanceof Element && event.target.closest('.tile, .card');
      if (element && !element.contains(event.relatedTarget)) {
        element.style.setProperty('--rx', '0deg');
        element.style.setProperty('--ry', '0deg');
      }
    };
    if (canHover && !reduceMotion) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('pointerout', resetTilt);
    }

    const photo =
      canHover && !reduceMotion ? document.querySelector('.photo.tilt') : null;
    const onPhotoMove = event => {
      const bounds = photo.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      gsap.to(photo, {
        transformPerspective: 900,
        rotateY: x * 16,
        rotateX: -y * 16,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };
    const onPhotoLeave = () => {
      gsap.to(photo, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };
    photo?.addEventListener('mousemove', onPhotoMove);
    photo?.addEventListener('mouseleave', onPhotoLeave);

    let refreshTimer;
    let disposed = false;
    const refresh = () => {
      if (disposed) return;
      clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    const chartGrid = document.querySelector('#github .stats');
    const chartCards = chartGrid ? [...chartGrid.children] : [];
    const chartMutationObserver = chartGrid
      ? new MutationObserver(refresh)
      : null;
    const chartResizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(refresh);
    chartMutationObserver?.observe(chartGrid, {
      childList: true,
      subtree: true,
    });
    chartCards.forEach(card => chartResizeObserver?.observe(card));
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);
    refresh();

    return () => {
      disposed = true;
      clearTimeout(refreshTimer);
      cancelAnimationFrame(spotlightFrame);
      chartMutationObserver?.disconnect();
      chartResizeObserver?.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerout', resetTilt);
      window.removeEventListener('load', refresh);
      photo?.removeEventListener('mousemove', onPhotoMove);
      photo?.removeEventListener('mouseleave', onPhotoLeave);
      context.revert();
    };
  }, []);

  return null;
}
