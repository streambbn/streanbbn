
import React, { useEffect } from 'react';

const SecurityGuard: React.FC = () => {
  useEffect(() => {
    let isKicked = false;

    const kickAndCrash = () => {
      if (isKicked) return;
      isKicked = true;

      // 1. Wipe the UI immediately
      try {
        document.body.innerHTML = `
          <div style="background:#000;color:#ff0000;height:100vh;display:flex;align-items:center;justify-content:center;font-family:monospace;flex-direction:column;text-align:center;padding:20px;position:fixed;top:0;left:0;width:100%;z-index:9999999;">
            <h1 style="font-size:3rem;margin-bottom:20px;">[ SECURITY BREACH DETECTED ]</h1>
            <p style="font-size:1.2rem;letter-spacing:2px;">UNAUTHORIZED INSPECTION ATTEMPT. SYSTEM LOCKDOWN INITIATED.</p>
            <p style="margin-top:50px;color:#333;">ACCESS PERMANENTLY REVOKED</p>
          </div>
        `;
      } catch (e) {}
      
      // 2. Clear Console
      console.clear();
      
      // 3. Trigger "Crash" / Hang without Stack Overflow
      setTimeout(() => {
        // Attempt to leave the page
        try {
          window.location.replace("about:blank");
        } catch (e) {}

        // Infinite loop to hang the thread (the "crash" behavior)
        // This makes the tab completely unresponsive
        while(true) {
          // Inner debugger to keep pausing if they try to continue
          (function() { return false; })["constructor"]("debugger")["call"]();
        }
      }, 500);
    };

    // Detection Logic 1: Debugger Timing
    const checkTiming = () => {
      const start = performance.now();
      // Inline debugger to detect if tools are open
      (function() { return false; })["constructor"]("debugger")["call"]();
      const end = performance.now();
      // Threshold for detection - if execution takes too long, tools are likely open
      if (end - start > 200) {
        kickAndCrash();
      }
    };

    // Detection Logic 2: Window Dimension Delta
    const checkDimensions = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if ((widthThreshold || heightThreshold) && window.outerWidth > 0) {
        kickAndCrash();
      }
    };

    // Detection Logic 3: Property Access via Console
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: function() {
        kickAndCrash();
        return 'secure-id';
      }
    });

    const interval = setInterval(() => {
      if (isKicked) {
        clearInterval(interval);
        return;
      }
      checkTiming();
      checkDimensions();
      // Some browsers evaluate properties on objects logged to console
      console.dir(element);
    }, 1000);

    // Disable Right Click
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    
    // Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
        (e.ctrlKey && e.keyCode === 85)
      ) {
        e.preventDefault();
        kickAndCrash();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
};

export default SecurityGuard;
