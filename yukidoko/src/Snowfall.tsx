import { useEffect } from "react";
import styles from './css/App.module.css';

function Snowfall() {
  useEffect(() => {
    const snowContainer = document.createElement("div");
    snowContainer.classList.add(styles.snowContainer);
    document.body.appendChild(snowContainer);

    for (let i = 0; i < 100; i++) {
      const snowflake = document.createElement("div");
      snowflake.classList.add(styles.snowflake);
      const size = Math.random() * 5 + 5; // 5px〜10pxのサイズ
      snowflake.style.width = `${size}px`;
      snowflake.style.height = `${size}px`;
      snowflake.style.left = `${Math.random() * 100}vw`;
      snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`;
      snowflake.style.animationDelay = `${Math.random() * 5}s`;

      snowContainer.appendChild(snowflake);
    }

    return () => {
      document.body.removeChild(snowContainer);
    };
  }, []);

  return null; // JSXには何も描画しない
}

export default Snowfall;
