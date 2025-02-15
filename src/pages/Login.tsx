import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initializeApp, getApps } from "firebase/app";
import {
    GoogleAuthProvider,
    User,
    getAuth,
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
} from "firebase/auth";
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

// Firebase 設定 (環境変数から取得)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Firebase アプリの初期化 (重複防止)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const Login: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info">("info");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setAlertMessage("ログインが完了しました。"); // ログイン完了メッセージ
                setAlertSeverity("success");
                setOpen(true);
                navigate("/Logined"); // リダイレクト
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const signIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("Google ログイン成功:", result.user); // 成功時のユーザー情報を確認
            setAlertMessage("Google ログインに成功しました。"); // 成功メッセージ
            setAlertSeverity("success");
            setOpen(true);
        } catch (error: any) {
            console.error("Google ログインエラー:", error.code, error.message);
            setAlertMessage(error.message); // エラーメッセージを表示
            setAlertSeverity("error");
            setOpen(true);
        }
    };


    const signInWithEmail = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            console.error(error);
            switch (error.code) {
                case "auth/user-not-found":
                    setAlertMessage("ユーザーが見つかりません。");
                    break;
                case "auth/wrong-password":
                    setAlertMessage("パスワードが間違っています。");
                    break;
                default:
                    setAlertMessage(error.message);
            }
            setAlertSeverity("error");
            setOpen(true);
        }
    };

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const handleRegisterClick = () => {
        navigate("/Auth");
    };

    const handlePasswordResetClick = () => {
        navigate("/ResetLogin");
    };

    return (
        <Container>
            <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: "100vh" }}>
                <Grid item xs={12} sm={8} md={6}>
                    <Paper elevation={3} sx={{ padding: 4 }}>
                        <Typography variant="h5" align="center" gutterBottom>
                            ログイン
                        </Typography>
                        <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="メールアドレス"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label="パスワード"
                                variant="outlined"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                fullWidth
                            />
                            <Button variant="contained" color="primary" onClick={signInWithEmail}>
                                メールアドレスでログイン
                            </Button>
                            <Button variant="contained" color="primary" onClick={signIn}>
                                Google でログイン
                            </Button>
                            <Button variant="contained" color="secondary" onClick={handleRegisterClick}>
                                新規登録
                            </Button>
                            <Button variant="text" color="primary" onClick={handlePasswordResetClick}>
                                パスワードを忘れた方はこちら
                            </Button>
                        </Box>
                        <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
                            <Alert onClose={handleClose} severity={alertSeverity} sx={{ width: '100%' }}>
                                {alertMessage}
                            </Alert>
                        </Snackbar>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};
