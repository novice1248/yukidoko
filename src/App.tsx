import { Routes, Route, Link, BrowserRouter, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import GoogleMapAPI from "./pages/GoogleMap";
import { Login } from "./pages/Login";
import Logout from "./pages/Logout";
import MyPage from "./pages/Mypage";
import ResetLogin from "./pages/ResetLogin";
import Drop from "./pages/Drop";
import Snowfall from "./Snowfall";
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
    return <p>読み込み中...</p>;
  }

  return isAuthenticated ? element : <Navigate to="/Login" replace />;
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = getAuth();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, [auth]);

  const isLoginPage = location.pathname.toLowerCase() === "/login";

  return (
    <div>
      <header className={styles.header}>
        {/* 左側：タイトルロゴ */}
        <Link to="/home" className={styles.title}>
          ゆきどこ
        </Link>

        {/* 右側：認証・アカウント周りのみ（すっきり配置） */}
        <nav className={styles.navBar}>
          <div className={styles.navAuth}>
            {!isAuthenticated ? (
              // ログインページ以外ならログインボタンを表示
              !isLoginPage && <Link to="/Login" className={styles.loginBtn}>ログイン</Link>
            ) : (
              // ログイン中ならマイページとログアウトを表示
              <div className={styles.loginedLinks}>
                <Link to="/Mypage" className={styles.headerLink}>マイページ</Link>
                <Link to="/Logout" className={styles.headerLink}>ログアウト</Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home isAuthenticated={isAuthenticated} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Logout" element={<Logout />} />
        <Route path="/Search" element={<GoogleMapAPI />} />
        <Route path="/ResetLogin" element={<ResetLogin />} />
        <Route path="/Drop" element={<Drop />} />
        <Route path="/Mypage" element={<MyPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter basename="/yukidoko">
      <Snowfall />
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
