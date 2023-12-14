import React, { useEffect } from 'react';
import particlesJS from 'particles.js';
import './ParticlesBackground.css';

const ParticlesBackground = () => {
  useEffect(() => {
    if (window.particlesJS) {
      window.particlesJS.load('particles-js', 'particlesjs.json', function() {
        console.log('particles.js loaded - callback');
      });
    }
  
    // 清除函数
    return () => {
      if (window.particlesJS) {
        window.particlesJS.destroy();
      }
    };
  }, []);
  

  return (
    <div id="particles-js" style={{ position: 'absolute', width: '100%', height: '100%' }}>
      {/* 粒子容器 */}
    </div>
  );
};

export default ParticlesBackground;
