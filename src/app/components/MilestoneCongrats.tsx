'use client';

import { useEffect } from 'react';
import Modal from './Modal';

export default function MilestoneCongrats() {
  useEffect(() => {
    let confettiInstance: any = null;
    let timer: any = null;

    (async () => {
      try {
        const { default: ConfettiGenerator } = await import('confetti-js');
        confettiInstance = new ConfettiGenerator({
          target: 'confetti-canvas',
          max: 150,
          size: 1,
          animate: true
        });
        confettiInstance.render();
        timer = setTimeout(() => {
          try { confettiInstance.clear(); } catch (_) {}
        }, 120000);
      } catch (e) {
        console.error('Failed to load confetti in MilestoneCongrats:', e);
      }
    })();

    return () => {
      if (timer) clearTimeout(timer);
      try { confettiInstance && confettiInstance.clear && confettiInstance.clear(); } catch (_) {}
    };
  }, []);

  return (
    <div className="milestone-congrats" role="status" aria-live="polite">
      <canvas id="confetti-canvas"></canvas>
      <div className="milestone-message">Congratulations ! You have completed your common core ! Get out of here !</div>
      <div className="milestone-actions">
        <button
          className="btn btn-logout"
          onClick={() => (window.location.href = '/42-blackhole-calculator/api/auth/logout')}
        >
          Logout
        </button>
      </div>
	  <Modal
    </div>
  );
}
