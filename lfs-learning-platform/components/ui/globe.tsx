import React from "react";

interface GlobeProps {
  size?: number;
  className?: string;
}

const Globe: React.FC<GlobeProps> = ({ size = 500, className = "" }) => {
  return (
    <>
      <style>
        {`
          @keyframes earthRotate {
            0% { background-position: 0 0; }
            100% { background-position: ${size * 2}px 0; }
          }
          @keyframes twinkling { 0%,100% { opacity:0.2; } 50% { opacity:1; } }
          @keyframes twinkling-slow { 0%,100% { opacity:0.2; } 50% { opacity:1; } }
          @keyframes twinkling-long { 0%,100% { opacity:0.15; } 50% { opacity:0.9; } }
          @keyframes twinkling-fast { 0%,100% { opacity:0.25; } 50% { opacity:1; } }
        `}
      </style>
      <div className={`flex items-center justify-center ${className}`}>
        <div
          className="relative rounded-full overflow-hidden shadow-[0_0_40px_rgba(100,150,255,0.3),-10px_0_15px_#c3f4ff_inset,30px_4px_50px_#000_inset,-48px_-4px_68px_#c3f4ff99_inset,500px_0_88px_#00000066_inset,300px_0_76px_#000000aa_inset]"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundImage: "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/globe.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "left",
            animation: "earthRotate 30s linear infinite",
          }}
        >
          {/* Stars around globe */}
          <div
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{ 
              left: `${-size * 0.08}px`,
              top: '0px',
              animation: "twinkling 3s infinite" 
            }}
          />
          <div
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{ 
              left: `${-size * 0.16}px`,
              top: `${size * 0.12}px`,
              animation: "twinkling-slow 2s infinite" 
            }}
          />
          <div
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{ 
              left: `${size * 1.4}px`,
              top: `${size * 0.36}px`,
              animation: "twinkling-long 4s infinite" 
            }}
          />
          <div
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{ 
              left: `${size * 0.8}px`,
              top: `${size * 1.16}px`,
              animation: "twinkling 3s infinite" 
            }}
          />
          <div
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{ 
              left: `${size * 0.2}px`,
              top: `${size * 1.08}px`,
              animation: "twinkling-fast 1.5s infinite" 
            }}
          />
          <div
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{ 
              left: `${size}px`,
              top: `${-size * 0.2}px`,
              animation: "twinkling-long 4s infinite" 
            }}
          />
          <div
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{ 
              left: `${size * 1.16}px`,
              top: `${size * 0.24}px`,
              animation: "twinkling-slow 2s infinite" 
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Globe;
