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

export const Login: React.FC = () => {
    const [, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info">("info");

    // Firebaseのエラーコードを日本語に変換するヘルパー関数
    const getErrorMessage = (errorCode: string): string => {
        switch (errorCode) {
            // メール・パスワード認証のエラー
            case "auth/user-not-found":
            case "auth/invalid-email": // メールアドレスの形式が正しくない場合など
                return "メールアドレスまたはパスワードが間違っています。";
            case "auth/wrong-password":
            case "auth/invalid-credential": // Firebase v10以降の統合されたエラーコード
                return "メールアドレスまたはパスワードが間違っています。";
            case "auth/too-many-requests":
                return "何度もログインに失敗したため、アカウントが一時的にロックされています。しばらく経ってから再度お試しください。";

            // Googleポップアップのエラー
            case "auth/popup-closed-by-user":
                return "ログインポップアップが閉じられました。もう一度お試しください。";
            case "auth/cancelled-popup-request":
                return "認証リクエストがキャンセルされました。";

            // 共通・その他
            default:
                return "ログインに失敗しました。時間をおいて再度お試しください。";
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setAlertMessage("ログインが完了しました。"); // ログイン完了メッセージ
                setAlertSeverity("success");
                setOpen(true);
                // 画面遷移を少し遅らせることで、ログイン成功のポップアップをユーザーに見せる
                setTimeout(() => {
                    navigate("/Logined"); // リダイレクト
                }, 1000);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    // Googleログイン
    const signIn = async () => {
        const provider = new GoogleAuthProvider();
        // 毎回アカウント選択画面を表示
        provider.setCustomParameters({ prompt: 'select_account' });

        try {
            const result = await signInWithPopup(auth, provider);
            console.log("ログイン成功: ", result.user);
        } catch (error: any) {
            console.error("ログインエラー: ", error);
            // 日本語エラーメッセージをセットしてポップアップを表示
            setAlertMessage(getErrorMessage(error.code));
            setAlertSeverity("error");
            setOpen(true);
        }
    };

    // メールアドレスログイン
    const signInWithEmail = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            console.error(error);
            // 日本語エラーメッセージをセットしてポップアップを表示
            setAlertMessage(getErrorMessage(error.code));
            setAlertSeverity("error");
            setOpen(true);
        }
    };

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
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