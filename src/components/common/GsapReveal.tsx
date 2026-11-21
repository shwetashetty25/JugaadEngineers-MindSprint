import React, { ElementType } from 'react';
import { useGsapReveal, GsapRevealOptions } from '../../hooks/useGsapReveal';

interface GsapRevealProps extends GsapRevealOptions {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
  id?: string;
}

export const GsapReveal: React.FC<GsapRevealProps> = ({
  children,
  className = '',
  as: Component = 'div',
  id,
  type = 'fade-up',
  duration = 0.85,
  delay = 0,
  stagger = 0.12,
  distance = 32,
  ease = 'power3.out',
  triggerHook = 'top 85%',
  once = true,
  selector,
}) => {
  const ref = useGsapReveal<HTMLElement>({
    type,
    duration,
    delay,
    stagger,
    distance,
    ease,
    triggerHook,
    once,
    selector,
  });

  return (
    <Component ref={ref} id={id} className={className}>
      {children}
    </Component>
  );
};

export default GsapReveal;

