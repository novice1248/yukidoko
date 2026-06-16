import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, User, updateProfile } from "firebase/auth"; // updateProfileを追加
import { Container, Typography, Button, CircularProgress, Paper, Box, TextField } from "@mui/material"; // TextFieldを追加

const MyPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState(""); // 表示名用のステート
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || ""); // すでに設定されていればセット
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  // 表示名を保存する関数
  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    setIsUpdating(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      });
      alert("表示名を更新しました！");
    } catch (error) {
      console.error("プロフィールの更新に失敗しました", error);
      alert("更新に失敗しました。");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Container>
    );
  }

  const isGoogleLogin = user?.providerData.some((provider) => provider.providerId === "google.com");

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, textAlign: "center", marginTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          マイページ
        </Typography>

        {/* 表示名（ニックネーム）設定用の入力欄を追加 */}
        <Box mt={3} mb={3} display="flex" flexDirection="column" gap={2}>
          <TextField
            label="表示名（マップに公開されます）"
            variant="outlined"
            fullWidth
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Button
            variant="contained"
            color="success"
            onClick={handleSaveProfile}
            disabled={isUpdating}
          >
            {isUpdating ? "更新中..." : "表示名を保存する"}
          </Button>
        </Box>

        <Typography variant="body1" gutterBottom style={{ color: "#666" }}>
          メールアドレス: {isGoogleLogin ? "Googleでログイン中" : user?.email || "登録されていません"}
        </Typography>
        <Box mt={4}>
          {!isGoogleLogin && (
            <Button variant="contained" color="primary" onClick={() => navigate("/ResetLogin")} sx={{ m: 1 }}>
              パスワード再設定
            </Button>
          )}
          <Button variant="contained" color="error" onClick={() => navigate("/Drop")} sx={{ m: 1 }}>
            アカウント削除
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default MyPage;
