import { useEffect, useRef } from "react";

const Snowfall = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    let snowflakes: { x: number; y: number; radius: number; speed: number }[] = [];    
    
    // 💡 ローカルストレージから管理画面の雪の数を取得（未設定なら初期値80）
    let numFlakes = Number(localStorage.getItem("admin_snow_count")) || 80;
    
    const minSpeed = 0.5;  // 最小速度
    const maxSpeed = 2;   // 最大速度

    // キャンバスサイズ調整
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 💡 雪の粒を生成する関数（再利用できるように切り出し）
    const createSnowflakes = (targetCount: number) => {
      const currentCount = snowflakes.length;

      if (currentCount < targetCount) {
        // 足りない分を新しく生成
        for (let i = currentCount; i < targetCount; i++) {
          snowflakes.push({
            x: Math.random() * canvas.width,
            // 💡 最初は大豪雪にした時に一気に上から降ってくると不自然なので、画面全体に散らす
            y: currentCount === 0 ? Math.random() * canvas.height : -Math.random() * 20,
            radius: Math.random() * 4 + 1,
            speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
          });
        }
      } else if (currentCount > targetCount) {
        // 多すぎる分は配列の後ろを削る
        snowflakes = snowflakes.slice(0, targetCount);
      }
    };

    // 初回の雪生成
    createSnowflakes(numFlakes);

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

    // アニメーションループの管理用ID
    let animationFrameId: number;

    const animate = () => {
      drawSnowflakes();
      updateSnowflakes();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 💡 管理画面から設定変更イベントが飛んできた時の処理
    const handleSettingsChange = () => {
      const updatedCount = Number(localStorage.getItem("admin_snow_count"));
      // 数値が有効な時だけ反映（スライダーが0の時は0個になる）
      if (!isNaN(updatedCount)) {
        numFlakes = updatedCount;
        createSnowflakes(numFlakes);
      }
    };

    // ウィンドウサイズ変更時にキャンバスサイズを調整
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    // 💡 管理者画面（Admin.tsx）からの「大豪雪/無雪」通知をここでキャッチ！
    window.addEventListener("admin_settings_changed", handleSettingsChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("admin_settings_changed", handleSettingsChange);
      cancelAnimationFrame(animationFrameId); // クリーンアップ時にアニメーションを止める
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        width: "100vw", 
        height: "100vh", 
        pointerEvents: "none", 
        zIndex: -1 
      }} 
    />
  );
};

export default Snowfall;
