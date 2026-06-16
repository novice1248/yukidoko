import { Routes, Route, Link, BrowserRouter, Navigate, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import GoogleMapAPI from "./pages/GoogleMap";
import { Login } from "./pages/Login";
import MyPage from "./pages/Mypage";
import ResetLogin from "./pages/ResetLogin";
import Drop from "./pages/Drop";
import Snowfall from "./Snowfall";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import styles from './css/App.module.css';
import Register from "./pages/Register";
import SetPassword from "./pages/SetPassword";
import Admin from "./pages/Admin";

// 💡 @mui/material のインポートに「Box」を追加
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Snackbar, Alert, Box } from "@mui/material";


function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false); // ポップアップの開閉状態
  
  // 💡 ログアウト通知用のステートを追加
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const auth = getAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, [auth]);

  const isLoginPage = location.pathname.toLowerCase() === "/login";

  // 実際にログアウトを実行する関数
  const handleLogoutConfirm = async () => {
    try {
      await signOut(auth);
      setLogoutDialogOpen(false); // ダイアログを閉じる
      
      // 💡 ポップアップメッセージを設定して表示する
      setSnackbarMessage("ログアウトしました。");
      setSnackbarOpen(true);

      // ポップアップをしっかり見せるために、1秒待ってからホームに移動する
      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (error) {
      console.error("ログアウトに失敗しました", error);
    }
  };

  return (
    <div>
      <header className={styles.header}>
        {/* 左側：タイトルロゴ */}
        <Link to="/home" className={styles.title}>
          ゆきどこ
        </Link>

        {/* 右側：認証・アカウント周り */}
        <nav className={styles.navBar}>
          <div className={styles.navAuth}>
            {!isAuthenticated ? (
              !isLoginPage && <Link to="/Login" className={styles.loginBtn}>ログイン</Link>
            ) : (
              <div className={styles.loginedLinks}>
                <Link to="/Mypage" className={styles.headerLink}>マイページ</Link>
                <span 
                  className={styles.headerLink} 
                  onClick={() => setLogoutDialogOpen(true)}
                  style={{ cursor: 'pointer' }}
                >
                  ログアウト
                </span>
              </div>
            )}
          </div>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home isAuthenticated={isAuthenticated} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Search" element={<GoogleMapAPI />} />
        <Route path="/ResetLogin" element={<ResetLogin />} />
        <Route path="/Drop" element={<Drop />} />
        <Route path="/Mypage" element={<MyPage />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/SetPassword" element={<SetPassword />} />
        <Route path="/Admin" element={<Admin />} />
      </Routes>

      {/* 確認ポップアップ（ダイアログ） */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        PaperProps={{
          style: { borderRadius: 16, padding: 8 }
        }}
      >
        <DialogTitle id="logout-dialog-title" style={{ fontWeight: 'bold' }}>
          {"ログアウトの確認"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            本当に「ゆきどこ」からログアウトしますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ padding: '8px 24px 16px' }}>
          <Button onClick={() => setLogoutDialogOpen(false)} color="inherit" variant="outlined" style={{ borderRadius: 20 }}>
            キャンセル
          </Button>
          <Button onClick={handleLogoutConfirm} color="error" variant="contained" style={{ borderRadius: 20 }} autoFocus>
            ログアウトする
          </Button>
        </DialogActions>
      </Dialog>

      {/* 💡 ログアウト完了を通知するポップアップを追加 */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // 画面の下側中央に表示
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', borderRadius: 2 }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* 🤫 全画面の右下にひっそり配置される、管理者専用の裏口ボタン */}
      <Box 
        sx={{ 
            position: "fixed", 
            bottom: 20, 
            right: 20, 
            zIndex: 999 
        }}
      >
        <Button 
            onClick={() => navigate("/Admin")}
            variant="outlined"
            sx={{ 
                fontSize: "0.85rem", 
                color: "rgba(44, 62, 80, 0.3)", 
                borderColor: "rgba(44, 62, 80, 0.2)", 
                minWidth: "auto",
                padding: "6px 12px", 
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.1)", 
                backdropFilter: "blur(4px)", 
                transition: "all 0.3s ease",
                '&:hover': { 
                    color: "#0056b3", 
                    borderColor: "#0056b3",
                    backgroundColor: "rgba(255, 255, 255, 0.8)", 
                    transform: "scale(1.05)"
                }
            }}
        >
            ⚙️ 管理画面
        </Button>
      </Box>
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
