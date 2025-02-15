import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography, Alert, Box } from "@mui/material";

const ResetLogin = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  const handleResetPassword = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("パスワードリセットのメールを送信しました。");
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        setError("このメールアドレスは登録されていません。");
      } else if (error.code === "auth/invalid-email") {
        setError("無効なメールアドレスです。");
      } else {
        setError("エラーが発生しました。もう一度お試しください。");
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 5, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          パスワード再設定
        </Typography>
        <form onSubmit={handleResetPassword}>
          <TextField
            fullWidth
            label="登録しているメールアドレス"
            variant="outlined"
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            送信
          </Button>
        </form>
        {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Button onClick={() => navigate("/login")} sx={{ mt: 2 }}>
          ログインページに戻る
        </Button>
      </Box>
    </Container>
  );
};

export default ResetLogin;

