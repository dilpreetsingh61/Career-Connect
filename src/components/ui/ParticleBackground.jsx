import React, { useRef, useEffect } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let isDark = document.documentElement.classList.contains('dark');
    let obstacles = [];

    const updateObstacles = () => {
      const elements = document.querySelectorAll('.particle-obstacle');
      obstacles = [];
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        obstacles.push({
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom
        });
      });
    };

    // Observer to detect theme changes live
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const newIsDark = document.documentElement.classList.contains('dark');
          if (isDark !== newIsDark) {
            isDark = newIsDark;
            const particleColor = isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(59, 130, 246, 0.4)';
            particles.forEach(p => p.color = particleColor);
          }
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      updateObstacles();
      initParticles();
    };

    // Mouse interaction
    let mouse = { x: null, y: null, radius: 120 };
    const handleMouseMove = (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };
    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', updateObstacles, true);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    class Particle {
      constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
        this.baseX = this.x;
        this.baseY = this.y;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      
      update() {
        // Bounce off edges
        if (this.x > canvas.width || this.x < 0) {
          this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.directionY = -this.directionY;
        }

        let nextX = this.x + this.directionX;
        let nextY = this.y + this.directionY;

        // Bounce off text obstacles
        for (let obs of obstacles) {
          if (nextX + this.size > obs.left && nextX - this.size < obs.right &&
              nextY + this.size > obs.top && nextY - this.size < obs.bottom) {
            
            if (this.x + this.size <= obs.left || this.x - this.size >= obs.right) {
              this.directionX = -this.directionX;
            } else if (this.y + this.size <= obs.top || this.y - this.size >= obs.bottom) {
              this.directionY = -this.directionY;
            } else {
              this.directionX = -this.directionX;
              this.directionY = -this.directionY;
            }
          }
        }

        // Mouse interaction (repel)
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (mouse.x != null && distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const maxDistance = mouse.radius;
          const force = (maxDistance - distance) / maxDistance;
          const directionX = forceDirectionX * force * 5;
          const directionY = forceDirectionY * force * 5;
          
          this.x -= directionX;
          this.y -= directionY;
        } else {
          // Slow return to normal speed
          if (this.x !== this.baseX) {
            let dx = this.x - this.baseX;
            this.x -= dx / 50;
          }
          if (this.y !== this.baseY) {
            let dy = this.y - this.baseY;
            this.y -= dy / 50;
          }
        }
        
        // Standard movement
        this.x += this.directionX;
        this.y += this.directionY;
        
        // Update base for next tick so it wanders slowly
        this.baseX += this.directionX;
        this.baseY += this.directionY;

        this.draw();
      }
    }

    const initParticles = () => {
      particles = [];
      // Increase amount slightly since there are no connecting lines
      let numberOfParticles = Math.floor((canvas.height * canvas.width) / 8000);
      const particleColor = isDark ? 'rgba(139, 92, 246, 0.6)' : 'rgba(59, 130, 246, 0.6)';
      
      for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 3) + 1.5;
        let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 1.5) - 0.75;
        let directionY = (Math.random() * 1.5) - 0.75;
        
        // Avoid spawning directly inside obstacles
        let inside = obstacles.some(obs => 
          x + size > obs.left && x - size < obs.right &&
          y + size > obs.top && y - size < obs.bottom
        );
        if (inside) continue;
        
        particles.push(new Particle(x, y, directionX, directionY, size, particleColor));
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
    };

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Initial fetch of obstacles, give DOM time to render text
    setTimeout(() => {
      updateObstacles();
      initParticles();
    }, 100);

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', updateObstacles, true);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 pointer-events-auto"
      style={{ pointerEvents: 'none' }} // we capture mouse on window so canvas itself can be pointer-events: none to not block clicks
    />
  );
};

export default ParticleBackground;
