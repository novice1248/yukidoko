import { Routes, Route, Link, BrowserRouter, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import NotLogin from "./pages/NotLogin";
import GoogleMapAPI from "./pages/GoogleMap";
import { Login } from "./pages/Login";
//import Auth from "./pages/Auth";
import Logout from "./pages/Logout";
import Logined from "./pages/Logined";
import Snowfall from "./Snowfall";
import ResetLogin from "./pages/ResetLogin";
import Drop from "./pages/Drop";
import MyPage from "./pages/Mypage";
import { JSX, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import styles from './css/App.module.css';

function PrivateRoute({ element }: { element: JSX.Element }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  if (isAuthenticated === null) {
    return <p>読み込み中...</p>; // 認証状態の取得中
  }

  return isAuthenticated ? element : <Navigate to="/Login" replace />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <BrowserRouter basename="/yukidoko">
      <Snowfall />
      <div>
        {/* ヘッダーエリアの共通化 */}
        <header className={styles.header}>
          <Link to="/home" className={styles.title}>
            ゆきどこ
          </Link>

          <nav className={styles.navBar}>
            <div className={styles.navAuth}>
              {!isAuthenticated ? (
                <Link to="/Login" className={styles.loginBtn}>ログイン</Link>
              ) : (
                <div className={styles.loginedLinks}>
                  <Link to="/Mypage" className={styles.headerLink}>マイページ</Link>
                  <Link to="/Logout" className={styles.headerLink}>ログアウト</Link>
                </div>
              )}
            </div>
          </nav>
        </header>

        <Routes>
          {/* 最初のアクセスで /home にリダイレクト */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* 認証状態を渡す */}
          <Route path="/home" element={<Home isAuthenticated={isAuthenticated} />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/auth" element={<Auth />} /> */}
          <Route path="/NotLogin" element={<NotLogin />} />
          <Route path="/Logout" element={<Logout />} />
          <Route path="/Search" element={<GoogleMapAPI />} />
          <Route path="/ResetLogin" element={<ResetLogin />} />
          <Route path="/Drop" element={<Drop />} />
          <Route path="/Mypage" element={<MyPage />} />
          <Route path="/Logined" element={<PrivateRoute element={<Logined />} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;