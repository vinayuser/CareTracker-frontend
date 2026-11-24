import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const VARIANTS = {
  up: 'm-reveal-up',
  left: 'm-reveal-left',
  right: 'm-reveal-right',
  fade: 'm-reveal-fade',
  zoom: 'm-reveal-zoom',
};

/**
 * Wrap content to reveal on scroll (Caretap-style ease-in-out).
 * variant: up | left | right | fade | zoom
 */
export function ScrollReveal({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  duration,
  className = '',
  once = true,
  children,
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      el.classList.add('is-inview');
      return undefined;
    }

    el.style.setProperty('--m-reveal-delay', `${delay}ms`);
    if (duration) el.style.setProperty('--m-reveal-duration', duration);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-inview');
          if (once) io.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [delay, duration, once]);

  return (
    <Tag
      ref={ref}
      className={`m-reveal ${VARIANTS[variant] || VARIANTS.up} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Stagger direct children on scroll.
 */
export function RevealStagger({
  as: Tag = 'div',
  className = '',
  stagger = 90,
  variant = 'up',
  children,
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const kids = [...root.children];
    kids.forEach((child, i) => {
      child.classList.add('m-reveal', VARIANTS[variant] || VARIANTS.up);
      child.style.setProperty('--m-reveal-delay', `${i * stagger}ms`);
      if (reduce) child.classList.add('is-inview');
    });

    if (reduce) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-inview');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );

    kids.forEach((child) => io.observe(child));
    return () => io.disconnect();
  }, [stagger, variant, children]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Auto-applies Caretap-like scroll reveals to marketing page sections.
 * Mount inside MarketingLayout around page content.
 */
export function MarketingScrollEffects({ children }) {
  const { pathname } = useLocation();
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const marked = [];

    const mark = (el, variantClass, delayMs = 0) => {
      if (!el || el.dataset.mRevealBound === '1') return;
      el.dataset.mRevealBound = '1';
      el.classList.add('m-reveal', variantClass);
      if (delayMs) el.style.setProperty('--m-reveal-delay', `${delayMs}ms`);
      marked.push(el);
      if (reduce) el.classList.add('is-inview');
    };

    const sections = [...root.querySelectorAll('section')];
    sections.forEach((section, index) => {
      const gridItems = [
        ...section.querySelectorAll(
          ':scope .grid > div, :scope .grid > article, :scope .grid > a, :scope .grid > li, :scope ol > li, :scope ul.grid > li',
        ),
      ].slice(0, 12);

      if (gridItems.length >= 2) {
        const heading = section.querySelector(':scope h1, :scope h2');
        if (heading) {
          const block =
            heading.closest('.text-center') ||
            heading.parentElement ||
            heading;
          mark(block, 'm-reveal-up', 0);
        }
        gridItems.forEach((item, i) => {
          mark(item, 'm-reveal-up', Math.min(80 + i * 85, 560));
        });
        return;
      }

      const variant =
        index % 4 === 1
          ? 'm-reveal-left'
          : index % 4 === 2
            ? 'm-reveal-right'
            : index % 4 === 3
              ? 'm-reveal-zoom'
              : 'm-reveal-up';
      mark(section, variant, Math.min(index * 30, 120));
    });

    root.querySelectorAll('[data-reveal]').forEach((el) => {
      const v = el.getAttribute('data-reveal') || 'up';
      const variantClass = VARIANTS[v] || VARIANTS.up;
      const delayAttr = Number(el.getAttribute('data-reveal-delay') || 0);
      mark(el, variantClass, delayAttr);
    });

    if (reduce) {
      return () => {
        marked.forEach((el) => {
          delete el.dataset.mRevealBound;
        });
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-inview');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' },
    );

    marked.forEach((el) => io.observe(el));

    requestAnimationFrame(() => {
      marked.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 40) {
          el.classList.add('is-inview');
          io.unobserve(el);
        }
      });
    });

    return () => {
      io.disconnect();
      marked.forEach((el) => {
        el.classList.remove(
          'm-reveal',
          'm-reveal-up',
          'm-reveal-left',
          'm-reveal-right',
          'm-reveal-fade',
          'm-reveal-zoom',
          'is-inview',
        );
        el.style.removeProperty('--m-reveal-delay');
        delete el.dataset.mRevealBound;
      });
    };
  }, [pathname]);

  return <div ref={rootRef}>{children}</div>;
}
