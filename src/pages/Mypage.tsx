import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Container, Typography, Button, CircularProgress, Paper, Box } from "@mui/material";

const MyPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate]);

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
        <Typography variant="body1" gutterBottom>
          メールアドレス: {isGoogleLogin ? "Googleでログイン中" : user?.email || "登録されていません"}
        </Typography>
        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={() => navigate("/ResetLogin")} sx={{ m: 1 }}>
            パスワード再設定
          </Button>
          <Button variant="contained" color="error" onClick={() => navigate("/Drop")} sx={{ m: 1 }}>
            アカウント削除
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default MyPage;
