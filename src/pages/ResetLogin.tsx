import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography, Paper, Box, Alert } from "@mui/material";

const ResetLogin = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length === 0) {
        throw new Error("auth/user-not-found");
      }

      await sendPasswordResetEmail(auth, email);
      setMessage("パスワードリセットのメールを送信しました。");
    } catch (error: any) {
      if (error.message === "auth/user-not-found") {
        setError("このメールアドレスは登録されていません。");
      } else if (error.code === "auth/invalid-email") {
        setError("無効なメールアドレスです。");
      } else {
        setError("エラーが発生しました。もう一度お試しください。");
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, textAlign: "center", marginTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          パスワード再設定
        </Typography>
        <form onSubmit={handleResetPassword}>
          <TextField
            fullWidth
            type="email"
            label="登録しているメールアドレス"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ marginBottom: 2 }}
          />
          <Button variant="contained" color="primary" type="submit" fullWidth>
            送信
          </Button>
        </form>
        {message && <Alert severity="success" sx={{ marginTop: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ marginTop: 2 }}>{error}</Alert>}
        <Box mt={2}>
          <Button variant="outlined" color="secondary" onClick={() => navigate("/login")} fullWidth>
            ログインページに戻る
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetLogin;
