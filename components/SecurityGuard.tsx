
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
      
      // 2. Clear Console to hide traces
      console.clear();
      
      // 3. Trigger "Crash" / Hang without Stack Overflow
      setTimeout(() => {
        try {
          // Attempt to redirect away
          window.location.replace("about:blank");
        } catch (e) {}

        // Infinite loop to hang the thread - makes the tab completely unresponsive
        // if they manage to stay on the page.
        while(true) {
          // Inner debugger to keep pausing if they try to bypass the loop
          (function() { return false; })["constructor"]("debugger")["call"]();
        }
      }, 500);
    };

    // Detection Logic: Debugger Timing Attack
    const checkTools = () => {
      const start = performance.now();
      // This debugger statement only pauses if DevTools is open
      (function() { return false; })["constructor"]("debugger")["call"]();
      const end = performance.now();
      
      // If the difference is significant, it means the debugger paused execution
      if (end - start > 100) {
        kickAndCrash();
      }
    };

    // Dimension Check: Detects docked DevTools
    const checkDimensions = () => {
      const threshold = 160;
      const isDevToolsOpen = 
        window.outerWidth - window.innerWidth > threshold || 
        window.outerHeight - window.innerHeight > threshold;
      
      if (isDevToolsOpen && window.outerWidth > 0) {
        kickAndCrash();
      }
    };

    const interval = setInterval(() => {
      if (!isKicked) {
        checkTools();
        checkDimensions();
      } else {
        clearInterval(interval);
      }
    }, 1000);

    // Disable Right Click
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    
    // Disable Key Combos (F12, Ctrl+Shift+I, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || // I, J, C
        (e.ctrlKey && e.keyCode === 85) // Ctrl+U (View Source)
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
