import { useEffect, useRef } from "react";

const Snowfall = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const snowflakes: { x: number; y: number; radius: number; speed: number }[] = [];    
    const numFlakes = 80; // 雪の粒の数
    const minSpeed = 0.5;  // 最小速度
    const maxSpeed = 2;  // 最大速度

    // キャンバスサイズ調整
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 雪の粒を作成
    for (let i = 0; i < numFlakes; i++) {
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 4 + 1, // 雪のサイズ
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed, // 落ちる速度
      });
    }

    const drawSnowflakes = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";

      snowflakes.forEach((flake) => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const updateSnowflakes = () => {
      snowflakes.forEach((flake) => {
        flake.y += flake.speed;
        if (flake.y > canvas.height) {
          flake.y = 0;
          flake.x = Math.random() * canvas.width;
        }
      });
    };

    const animate = () => {
      drawSnowflakes();
      updateSnowflakes();
      requestAnimationFrame(animate);
    };

    animate();

    // ウィンドウサイズ変更時にキャンバスサイズを調整
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: -1 }} />;
};

export default Snowfall;
