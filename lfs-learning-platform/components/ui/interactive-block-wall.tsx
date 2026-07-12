"use client";

import React, { useEffect, useRef } from "react";

export default function InteractiveBlockWall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking with smooth lerp
    const targetMouse = { x: width * 0.7, y: height * 0.4 };
    const currentMouse = { x: width * 0.7, y: height * 0.4 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse.x = e.clientX - rect.left;
      targetMouse.y = e.clientY - rect.top;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        targetMouse.x = e.touches[0].clientX - rect.left;
        targetMouse.y = e.touches[0].clientY - rect.top;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Cube Grid parameters
    const blockSize = 85; // Size of each block
    const gap = 4; // Gap between blocks
    const cols = Math.ceil(width / (blockSize + gap)) + 2;
    const rows = Math.ceil(height / (blockSize + gap)) + 2;

    const render = () => {
      // Smooth lerp mouse position
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.12;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.12;

      ctx.fillStyle = "#0a0a0d";
      ctx.fillRect(0, 0, width, height);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const baseX = c * (blockSize + gap);
          const baseY = r * (blockSize + gap);
          const centerX = baseX + blockSize / 2;
          const centerY = baseY + blockSize / 2;

          // Distance to cursor
          const dx = currentMouse.x - centerX;
          const dy = currentMouse.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 320;
          const influence = Math.max(0, 1 - dist / maxDist);
          const easeInfluence = influence * influence * (3 - 2 * influence);

          // 3D elevation & tilt effect on hover
          const elevation = easeInfluence * -10;
          const drawX = baseX + (dx / maxDist) * easeInfluence * -6;
          const drawY = baseY + (dy / maxDist) * easeInfluence * -6 + elevation;

          // Draw cube shadow
          ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
          ctx.fillRect(baseX + 4, baseY + 4, blockSize, blockSize);

          // Cube Base Color (Dark charcoal metallic gradient simulation)
          const baseLight = Math.floor(18 + easeInfluence * 14);
          ctx.fillStyle = `rgb(${baseLight}, ${baseLight + 2}, ${baseLight + 4})`;
          ctx.fillRect(drawX, drawY, blockSize, blockSize);

          // Inner bevel highlight
          ctx.fillStyle = `rgb(${baseLight + 8}, ${baseLight + 10}, ${baseLight + 12})`;
          ctx.fillRect(drawX + 2, drawY + 2, blockSize - 4, blockSize - 4);

          // Hover Green Border Glow
          if (easeInfluence > 0.02) {
            const glowAlpha = easeInfluence * 0.95;
            ctx.strokeStyle = `rgba(34, 197, 94, ${glowAlpha})`;
            ctx.lineWidth = 1.5 + easeInfluence * 2.5;
            ctx.strokeRect(drawX, drawY, blockSize, blockSize);

            // Subtle corner accent light
            if (easeInfluence > 0.3) {
              ctx.fillStyle = `rgba(74, 222, 128, ${easeInfluence * 0.4})`;
              ctx.fillRect(drawX, drawY, 8, 8);
            }
          } else {
            // Default subtle dark border
            ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            ctx.lineWidth = 1;
            ctx.strokeRect(drawX, drawY, blockSize, blockSize);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block pointer-events-auto cursor-crosshair"
    />
  );
}
