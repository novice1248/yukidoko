import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApps, initializeApp } from "firebase/app";
import {
    GoogleAuthProvider,
    User,
    getAuth,
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword, // 👈 新規登録用の関数を追加
    updateProfile,                  // 👈 登録時に初期の表示名をセットするため追加
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
    ButtonGroup,
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
    const [displayName, setDisplayName] = useState(""); // 👈 新規登録用の表示名ステート
    
    // 💡 現在のモードを管理 ("login" または "register")
    const [mode, setMode] = useState<"login" | "register">("login");

    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info">("info");

    // Firebaseのエラーコードを日本語に変換するヘルパー関数
    const getErrorMessage = (errorCode: string): string => {
        switch (errorCode) {
            // メール・パスワード認証のエラー
            case "auth/user-not-found":
            case "auth/wrong-password":
            case "auth/invalid-credential":
                return "メールアドレスまたはパスワードが間違っています。";
            case "auth/invalid-email":
                return "メールアドレスの形式が正しくありません。";
            case "auth/email-already-in-use":
                return "このメールアドレスはすでに登録されています。";
            case "auth/weak-password":
                return "パスワードは6文字以上で入力してください。";
            case "auth/too-many-requests":
                return "何度も失敗したためアカウントが一時ロックされています。しばらく経ってから再度お試しください。";
            
            // Googleポップアップのエラー
            case "auth/popup-closed-by-user":
                return "ログインポップアップが閉じられました。もう一度お試しください。";
            
            default:
                return "認証に失敗しました。時間をおいて再度お試しください。";
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setAlertMessage(mode === "login" ? "ログインしました。" : "アカウントを作成しました！");
                setAlertSeverity("success");
                setOpen(true);
                // ポップアップを見せるために1秒待って遷移
                setTimeout(() => {
                    navigate("/home");
                }, 1000);
            }
        });

        return () => unsubscribe();
    }, [navigate, mode]);

    // Googleログイン
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        try {
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error("Google認証エラー: ", error);
            setAlertMessage(getErrorMessage(error.code));
            setAlertSeverity("error");
            setOpen(true);
        }
    };

    // メールアドレスでの処理（ログイン or 新規登録をスイッチ）
    const handleEmailAuth = async () => {
        if (!email || !password) {
            setAlertMessage("メールアドレスとパスワードを入力してください。");
            setAlertSeverity("error");
            setOpen(true);
            return;
        }

        try {
            if (mode === "login") {
                // 🔓 ログイン処理
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // 📝 新規登録処理
                if (!displayName.trim()) {
                    setAlertMessage("表示名（ニックネーム）を入力してください。");
                    setAlertSeverity("error");
                    setOpen(true);
                    return;
                }
                // アカウント作成
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // 作成と同時に、入力された表示名をユーザー情報に反映
                if (userCredential.user) {
                    await updateProfile(userCredential.user, {
                        displayName: displayName
                    });
                }
            }
        } catch (error: any) {
            console.error(error);
            setAlertMessage(getErrorMessage(error.code));
            setAlertSeverity("error");
            setOpen(true);
        }
    };

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setOpen(false);
    };

    return (
        <Container>
            <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: "80vh" }}>
                <Grid item xs={12} sm={8} md={6}>
                    <Paper elevation={3} sx={{ padding: 4, borderRadius: 4 }}>
                        
                        {/* 💡 ログインと新規登録を切り替えるタブ型のボタン */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
                            <ButtonGroup variant="outlined" fullWidth>
                                <Button 
                                    variant={mode === "login" ? "contained" : "outlined"}
                                    onClick={() => setMode("login")}
                                >
                                    ログイン
                                </Button>
                                <Button 
                                    variant={mode === "register" ? "contained" : "outlined"}
                                    onClick={() => setMode("register")}
                                >
                                    新規登録
                                </Button>
                            </ButtonGroup>
                        </Box>

                        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                            {mode === "login" ? "ログイン" : "アカウント新規登録"}
                        </Typography>

                        <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            
                            {/* 💡 新規登録モードの時だけ表示名フィールドを出す */}
                            {mode === "register" && (
                                <TextField
                                    label="表示名（ニックネーム）"
                                    variant="outlined"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    fullWidth
                                    required
                                />
                            )}

                            <TextField
                                label="メールアドレス"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                fullWidth
                                required
                            />
                            <TextField
                                label="パスワード"
                                variant="outlined"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                fullWidth
                                required
                            />

                            <Button variant="contained" color="primary" size="large" onClick={handleEmailAuth} sx={{ mt: 1, borderRadius: 2 }}>
                                {mode === "login" ? "メールアドレスでログイン" : "この内容で新規登録"}
                            </Button>

                            <Button variant="outlined" color="inherit" size="large" onClick={signInWithGoogle} sx={{ borderRadius: 2 }}>
                                Google でログイン / 登録
                            </Button>

                            {mode === "login" && (
                                <Button variant="text" color="primary" onClick={() => navigate("/ResetLogin")} sx={{ fontSize: '0.85rem' }}>
                                    パスワードを忘れた方はこちら
                                </Button>
                            )}
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
