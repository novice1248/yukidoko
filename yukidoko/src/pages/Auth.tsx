import React, { Fragment, useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography, // 追加
  Paper, // 追加
  Snackbar, // 追加
  Alert, // 追加
} from "@mui/material";

const Auth: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [open, setOpen] = useState(false); // Snackbar の状態
  const [alertMessage, setAlertMessage] = useState(""); // Snackbar のメッセージ
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">("info"); // Snackbar の種類

  const navigate = useNavigate();

  const Register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setAlertMessage("登録に成功しました。");
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
                新規登録
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
                  onClick={Register}
                >
                  メールアドレスで登録
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary" // Google ログインは secondary
                  sx={{ mt: 2 }}
                  onClick={signInWithGoogle}
                >
                  Google で登録
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