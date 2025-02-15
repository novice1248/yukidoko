import { Routes, Route, Link, BrowserRouter } from "react-router-dom";
//Routes、Route、Link、BrowserRouterをインポートし、ルーティング
import Home from "./pages/Home"; // ホームページのコンポーネント
//import GoogleMap from "./pages/GoogleMap"; // Aboutページのコンポーネント
import styles from './css/App.module.css';

function App() {
  return (
    <BrowserRouter>
    {/* BrowserRouterで囲みます */}
      <div>
        <h1 className={styles.title}>React Router Vite デモ</h1>
        <nav>
          <ul>
            <li>
              <Link to="/">ホーム</Link>
            </li>
            <li>
              <Link to="/googleMap">GoogleMap</Link>
            </li>
          </ul>
        </nav>

        {/* ルーティングの設定 */}
        <Routes>
          <Route  path="/" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;