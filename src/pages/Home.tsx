import { Link } from "react-router-dom";
import styles from '../css/App.module.css';

interface HomeProps {
  isAuthenticated: boolean;
}

function Home({ isAuthenticated }: HomeProps) {
  return (
    <div className={styles.homeContainer}>
      {/* メインの紹介エリア（すりガラスの座布団） */}
      <div className={styles.heroCard}>
        <h2 className={styles.heroTitle}>除雪されている場所を探そう</h2>
        <p className={styles.heroDescription}>
          「ゆきどこ」は、除雪されている道をみんなで情報共有するサイトです。
          実際に現地に行かなくてもユーザーが投稿したルートをたどることで、安全に目的地にたどり着くことができます。
        </p>

        {/* ボタンを文章のすぐ下に配置 */}
        <div className={styles.homeActions}>
          <Link to="/Search" className={styles.btnSearch}>探す</Link>
          <Link to={isAuthenticated ? "/Search" : "/NotLogin"} className={styles.btnShare}>
            共有する
          </Link>
        </div>
      </div>

      {/* 下部の空きスペースに配置する3つの特徴カード */}
      <div className={styles.featuresSection}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🗺️</div>
          <h3>探す</h3>
          <p>マップから今除雪されているルートをリアルタイムでチェック！</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>👣</div>
          <h3>歩く・走る</h3>
          <p>みんなの情報をもとに、安全な道を選んで冬の移動を快適に。</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>❄️</div>
          <h3>共有する</h3>
          <p>あなたが通った除雪ルートを投稿して、みんなの安全を助けよう！</p>
        </div>
      </div>
    </div>
  );
}

export default Home;