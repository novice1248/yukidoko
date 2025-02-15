import { Routes, Route, Link, BrowserRouter } from "react-router-dom";
//Routes、Route、Link、BrowserRouterをインポートし、ルーティング
import Home from "./pages/Home"; // ホームページのコンポーネント
import GoogleMapAPI from "./pages/GoogleMap";
import Geolocation from "./pages/GeoLocation";
import Auth from "./pages/Auth"; // ログインページのコンポーネント
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
            <li>
              <Link to="/geolocation">Geolocation</Link>
            </li>
            <li>
              <Link to="/login">ログイン</Link>
            </li>
          </ul>
        </nav>

        {/* ルーティングの設定 */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/googleMap" element={<GoogleMapAPI />} />
          <Route path="/geolocation" element={<Geolocation />} />
          <Route  path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;