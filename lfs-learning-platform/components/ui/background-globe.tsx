import React from "react";
import Globe from "./globe";

interface BackgroundGlobeProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  size?: number;
  opacity?: number;
  animate?: boolean;
}

const BackgroundGlobe: React.FC<BackgroundGlobeProps> = ({ 
  position = "top-right", 
  size = 400,
  opacity = 0.3,
  animate = true
}) => {
  const positionClasses = {
    "top-left": "top-0 left-0 -translate-x-1/4 -translate-y-1/4",
    "top-right": "top-0 right-0 translate-x-1/4 -translate-y-1/4",
    "bottom-left": "bottom-0 left-0 -translate-x-1/4 translate-y-1/4",
    "bottom-right": "bottom-0 right-0 translate-x-1/4 translate-y-1/4",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
  };

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-0 pointer-events-none ${animate ? 'animate-float' : ''}`}
      style={{ 
        opacity,
        filter: 'blur(1px)',
      }}
    >
      <Globe size={size} />
    </div>
  );
};

export default BackgroundGlobe;
