import React, { Fragment, useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword // 追加
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";

const Auth: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">("info");
  const [isRegistering, setIsRegistering] = useState(true); // 登録/ログイン切り替え
  const navigate = useNavigate();

  const handleAuthAction = async () => {
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        setAlertMessage("登録に成功しました。再度ログインしてください。");
        setAlertSeverity("success");
        setOpen(true);
        await signOut(auth);
        navigate("/login"); // 登録成功後に遷移
      } else {
        await signInWithEmailAndPassword(auth, email, password); // ログイン
        setAlertMessage("ログインに成功しました。");
        setAlertSeverity("success");
        setOpen(true);
        navigate("/"); // ログイン成功後に遷移
      }
    } catch (error) {
      setAlertMessage(error.message);
      setAlertSeverity("error");
      setOpen(true);
      console.error(error);
    }
  };


  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setAlertMessage("Google ログインに成功しました。");
      setAlertSeverity("success");
      setOpen(true);
      navigate("/home");
    } catch (error) {
      setAlertMessage(error.message);
      setAlertSeverity("error");
      setOpen(true);
      console.error(error);
    }
  };

  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.currentTarget.value);
  };

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.currentTarget.value);
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Fragment>
      <Container>
        <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: "100vh" }}>
          <Grid item xs={12} sm={8} md={6}>
            <Paper elevation={3} sx={{ padding: 4 }}>
              <Typography variant="h5" align="center" gutterBottom>
                {isRegistering ? "新規登録" : "ログイン"} {/* タイトル切り替え */}
              </Typography>
              <Box component="form">
                <TextField
                  fullWidth
                  label="E-mail"
                  variant="outlined"
                  margin="normal"
                  value={email}
                  onChange={handleChangeEmail}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  variant="outlined"
                  margin="normal"
                  type="password"
                  value={password}
                  onChange={handleChangePassword}
                  required
                  inputProps={{ minLength: 6 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={handleAuthAction} // 共通の関数に変更
                >
                  {isRegistering ? "メールアドレスで登録" : "メールアドレスでログイン"} {/* ボタンテキスト切り替え */}
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  sx={{ mt: 2 }}
                  onClick={signInWithGoogle}
                >
                  Google で{isRegistering ? "登録" : "ログイン"} {/* Googleボタンテキスト切り替え */}
                </Button>
                <Button // 登録/ログイン切り替えボタン
                  fullWidth
                  variant="text"
                  sx={{ mt: 2 }}
                  onClick={() => setIsRegistering(!isRegistering)}
                >
                  {isRegistering ? "既にアカウントをお持ちですか？ログイン" : "アカウントをお持ちではありませんか？登録"}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={alertSeverity} sx={{ width: '100%' }}>
            {alertMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Fragment>
  );
};

export default Auth;
