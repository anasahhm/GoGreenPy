import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * useLenisScroll - Initialize and manage Lenis smooth scrolling
 * 
 * Usage in App.jsx:
 * 
 * import useLenisScroll from './hooks/useLenisScroll';
 * 
 * function App() {
 *   useLenisScroll();
 *   return (...)
 * }
 */

export const useLenisScroll = () => {
  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,          // Duration of scroll animation in seconds
      easing: (t) => {        // Easing function
        return t === 1 
          ? 1 
          : 1 - Math.pow(2, -10 * t);
      },
      direction: 'vertical',  // Can be 'vertical' or 'horizontal'
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,     // Disable smooth scrolling on touch devices
      touchMultiplier: 2,     // Multiply touch scroll speed
    });

    // Listen for the scroll event and log the instance
    const handleScroll = () => {
      // Update any elements that need scroll position tracking
    };

    lenis.on('scroll', handleScroll);

    // Use requestAnimationFrame to update scroll
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    const animationFrameId = requestAnimationFrame(raf);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);
};

export default useLenisScroll;