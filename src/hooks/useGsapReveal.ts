import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export type RevealAnimationType =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'fade-in'
  | 'scale-up'
  | 'stagger';

export interface GsapRevealOptions {
  type?: RevealAnimationType;
  duration?: number;
  delay?: number;
  stagger?: number;
  distance?: number;
  ease?: string;
  triggerHook?: string; // e.g., 'top 85%'
  once?: boolean;
  selector?: string; // Child selector for stagger
}

/**
 * Hook to apply high-performance GSAP ScrollTrigger reveal animations
 * adhering to modern-web-guidance (compositor-only properties, prefers-reduced-motion check,
 * and comprehensive gsap.context() lifecycle cleanup).
 */
export function useGsapReveal<T extends HTMLElement = HTMLDivElement>(
  options: GsapRevealOptions = {}
) {
  const containerRef = useRef<T>(null);

  const {
    type = 'fade-up',
    duration = 0.85,
    delay = 0,
    stagger = 0.12,
    distance = 36,
    ease = 'power3.out',
    triggerHook = 'top 85%',
    once = true,
    selector,
  } = options;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Accessibility: Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Ensure element is fully visible without motion
      gsap.set(selector ? el.querySelectorAll(selector) : el, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        clearProps: 'all',
      });
      return;
    }

    const ctx = gsap.context(() => {
      const targets = selector ? el.querySelectorAll(selector) : el;
      if (!targets || (targets instanceof NodeList && targets.length === 0)) return;

      let fromVars: gsap.TweenVars = { opacity: 0 };
      const toVars: gsap.TweenVars = {
        opacity: 1,
        duration,
        delay,
        ease,
        clearProps: 'transform',
      };

      switch (type) {
        case 'fade-up':
          fromVars = { opacity: 0, y: distance };
          toVars.y = 0;
          break;
        case 'fade-down':
          fromVars = { opacity: 0, y: -distance };
          toVars.y = 0;
          break;
        case 'fade-left':
          fromVars = { opacity: 0, x: distance };
          toVars.x = 0;
          break;
        case 'fade-right':
          fromVars = { opacity: 0, x: -distance };
          toVars.x = 0;
          break;
        case 'scale-up':
          fromVars = { opacity: 0, scale: 0.92 };
          toVars.scale = 1;
          break;
        case 'stagger':
          fromVars = { opacity: 0, y: distance };
          toVars.y = 0;
          toVars.stagger = stagger;
          break;
        case 'fade-in':
        default:
          fromVars = { opacity: 0 };
          break;
      }

      gsap.fromTo(targets, fromVars, {
        ...toVars,
        scrollTrigger: {
          trigger: el,
          start: triggerHook,
          toggleActions: once ? 'play none none none' : 'play reverse play reverse',
          once,
        },
      });
    }, el);

    return () => {
      ctx.revert();
    };
  }, [type, duration, delay, stagger, distance, ease, triggerHook, once, selector]);

  return containerRef;
}

export default useGsapReveal;

