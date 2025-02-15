import { Routes, Route, Link, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotLogin from "./pages/NotLogin";
import styles from './css/App.module.css';

import Snowfall from "./Snowfall";

function App() {
  return (
    <BrowserRouter>
      <Snowfall />
      <div>
        <Link to="/" className={styles.title}>
          ゆきどこ
        </Link>

        <nav>
          {/* ログイン・新規登録 (右上) */}
          <div className={styles.navAuth}>
            <Link to="/Login">ログイン</Link>
          </div>

          <ul>
            {/* 探す・共有する (横並び) */}
            <div className={styles.navActions}>
              <li>
                <Link to="/Search">探す</Link>
              </li>
              <li>
                <Link to="/NotLogin">共有する</Link>
              </li>
            </div>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/NotLogin" element={<NotLogin />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;

