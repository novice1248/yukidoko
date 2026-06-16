import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, isSignInWithEmailLink, signInWithEmailLink, updatePassword, updateProfile } from "firebase/auth";
import { Box, Button, Container, Grid, TextField, Typography, Paper, Snackbar, Alert, CircularProgress } from "@mui/material";

export const SetPassword: React.FC = () => {
    const [password, setPassword] = useState("");
    const [isVerifying, setIsVerifying] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info">("info");

    const auth = getAuth();

    useEffect(() => {
        // 💡 URLがFirebaseのメールリンクかどうかを判定
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem("emailForSignIn");
            
            // 別のブラウザ等で開いた場合はメアドが消えているので、直接入力させる
            if (!email) {
                email = window.prompt("確認のため、登録したメールアドレスを入力してください。");
            }

            if (email) {
                signInWithEmailLink(auth, email, window.location.href)
                    .then((result) => {
                        window.localStorage.removeItem("emailForSignIn");
                        // 💡 登録画面で保存した名前をプロフィールに設定
                        const savedName = window.localStorage.getItem("displayNameForSignIn");
                        if (savedName && result.user) {
                            updateProfile(result.user, { displayName: savedName });
                            window.localStorage.removeItem("displayNameForSignIn");
                        }
                        setIsVerifying(false);
                        setIsVerified(true);
                    })
                    .catch((error) => {
                        console.error(error);
                        setAlertMessage("リンクが無効、または期限切れです。もう一度登録からやり直してください。");
                        setAlertSeverity("error");
                        setOpen(true);
                        setIsVerifying(false);
                    });
            } else {
                setIsVerifying(false);
            }
        } else {
            setIsVerifying(false);
        }
    }, [auth]);

    const handleSavePassword = async () => {
        if (password.length < 6) {
            setAlertMessage("パスワードは6文字以上で入力してください。");
            setAlertSeverity("error");
            setOpen(true);
            return;
        }

        try {
            if (auth.currentUser) {
                await updatePassword(auth.currentUser, password);
                setAlertMessage("パスワードを設定し、登録が完了しました！");
                setAlertSeverity("success");
                setOpen(true);
                
                setTimeout(() => {
                    navigate("/home");
                }, 1500);
            }
        } catch (error) {
            console.error(error);
            setAlertMessage("パスワードの設定に失敗しました。");
            setAlertSeverity("error");
            setOpen(true);
        }
    };

    if (isVerifying) {
        return (
            <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container>
            <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: "80vh" }}>
                <Grid item xs={12} sm={8} md={6}>
                    <Paper elevation={3} sx={{ padding: 4, borderRadius: 4 }}>
                        {!isVerified ? (
                            <Typography color="error" align="center">無効なリンクです。トップページに戻ってやり直してください。</Typography>
                        ) : (
                            <>
                                <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                                    パスワードの設定
                                </Typography>
                                <Typography variant="body2" align="center" sx={{ mb: 3, color: "text.secondary" }}>
                                    メールの確認が完了しました。今後のログインで使用するパスワードを設定してください。
                                </Typography>
                                <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField label="新しいパスワード" variant="outlined" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required />
                                    <Button variant="contained" color="success" size="large" onClick={handleSavePassword} sx={{ mt: 1, borderRadius: 2 }}>
                                        設定して完了する
                                    </Button>
                                </Box>
                            </>
                        )}
                        <Snackbar open={open} autoHideDuration={5000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                            <Alert severity={alertSeverity} sx={{ width: '100%', borderRadius: 2 }}>{alertMessage}</Alert>
                        </Snackbar>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default SetPassword;
