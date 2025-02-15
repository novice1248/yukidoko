import { Routes, Route, Link, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import NotLogin from "./pages/NotLogin";
import GoogleMapAPI from "./pages/GoogleMap";
import { Login } from "./pages/Login";
import Auth from "./pages/Auth";
import Logout from "./pages/Logout";
import Logined from "./pages/Logined";
import Snowfall from "./Snowfall";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import styles from './css/App.module.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Snowfall />
      <div>
        <Link to="/" className={styles.title}>
          ゆきどこ
        </Link>

        <nav>
          <div className={styles.navAuth}>
            {!isAuthenticated ? (
              <Link to="/Login">ログイン</Link>
            ) : (
              <Link to="/Logout">ログアウト</Link>
            )}
          </div>

          <ul>
            <div className={styles.navActions}>
              <li>
                <Link to="/Search">探す</Link>
              </li>
              <li>
                <Link to={isAuthenticated ? "/Logined" : "/NotLogin"}>共有する</Link>
              </li>

            </div>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/NotLogin" element={<NotLogin />} />
          <Route path="/Logout" element={<Logout />} />
          <Route path="/Search" element={<GoogleMapAPI />} />
          <Route path="/Logined" element={<Logined />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
