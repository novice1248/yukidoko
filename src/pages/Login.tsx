import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithPopup, signInWithEmailAndPassword, updateProfile, getAdditionalUserInfo, GoogleAuthProvider } from "firebase/auth";
import { Box, Button, Container, Grid, TextField, Typography, Paper, Snackbar, Alert } from "@mui/material";

export const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [mode, setMode] = useState<"login" | "googleSetup">("login");
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info">("info");

    const auth = getAuth();

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        try {
            const result = await signInWithPopup(auth, provider);
            const additionalInfo = getAdditionalUserInfo(result);
            if (additionalInfo?.isNewUser) {
                setDisplayName(result.user.displayName || "");
                setMode("googleSetup");
            } else {
                setAlertMessage("ログインしました。");
                setAlertSeverity("success");
                setOpen(true);
                setTimeout(() => navigate("/home"), 1000);
            }
        } catch (error: any) {
            setAlertMessage("ログインに失敗しました。");
            setAlertSeverity("error");
            setOpen(true);
        }
    };

    const handleGoogleSetupComplete = async () => {
        if (!displayName.trim()) return;
        try {
            if (auth.currentUser) await updateProfile(auth.currentUser, { displayName });
            setAlertMessage("登録が完了しました！");
            setAlertSeverity("success");
            setOpen(true);
            setTimeout(() => navigate("/home"), 1000);
        } catch (error) {
            setAlertMessage("エラーが発生しました。");
            setAlertSeverity("error");
            setOpen(true);
        }
    };

    const handleEmailLogin = async () => {
        if (!email || !password) return;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setAlertMessage("ログインしました。");
            setAlertSeverity("success");
            setOpen(true);
            setTimeout(() => navigate("/home"), 1000);
        } catch (error: any) {
            setAlertMessage("メールアドレスまたはパスワードが間違っています。");
            setAlertSeverity("error");
            setOpen(true);
        }
    };

    return (
        <Container>
            <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: "80vh" }}>
                <Grid item xs={12} sm={8} md={6}>
                    <Paper elevation={3} sx={{ padding: 4, borderRadius: 4 }}>
                        {mode === "googleSetup" ? (
                            <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Typography variant="h5" align="center" sx={{ fontWeight: 'bold' }}>Googleで登録完了！</Typography>
                                <Typography variant="body2" align="center" color="text.secondary">公開される表示名を確認・変更して続行してください。</Typography>
                                <TextField label="表示名（ニックネーム）" variant="outlined" value={displayName} onChange={(e) => setDisplayName(e.target.value)} fullWidth required />
                                <Button variant="contained" color="primary" size="large" onClick={handleGoogleSetupComplete} sx={{ borderRadius: 2 }}>続行して始める</Button>
                            </Box>
                        ) : (
                            <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>ログイン</Typography>
                                <TextField label="メールアドレス" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
                                <TextField label="パスワード" variant="outlined" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required />

                                <Button variant="contained" color="primary" size="large" onClick={handleEmailLogin} sx={{ mt: 1, borderRadius: 2 }}>メールアドレスでログイン</Button>
                                <Button variant="outlined" color="inherit" size="large" onClick={signInWithGoogle} sx={{ borderRadius: 2 }}>Google でログイン / 登録</Button>

                                <Box display="flex" justifyContent="space-between" mt={1}>
                                    <Button variant="text" color="primary" onClick={() => navigate("/ResetLogin")} sx={{ fontSize: '0.85rem' }}>パスワードを忘れた方</Button>
                                    <Button variant="text" color="secondary" onClick={() => navigate("/Register")} sx={{ fontSize: '0.85rem' }}>新規登録はこちら</Button>
                                </Box>
                            </Box>
                        )}
                        <Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                            <Alert severity={alertSeverity} sx={{ width: '100%', borderRadius: 2 }}>{alertMessage}</Alert>
                        </Snackbar>
                    {/* 🤫 右下にひっそり隠された、管理者専用の裏口ボタン */}
    {/* 🤫 右下にひっそり隠された、管理者専用の裏口ボタン（ちょっと拡大版） */}
    <Box 
        sx={{ 
            position: "fixed", 
            bottom: 20, // 少し内側に寄せて押しやすく
            right: 20, 
            zIndex: 999 
        }}
    >
        
    </Box>

  </Paper>
</Grid>
</Grid>
</Container> // 👈 一番最後の閉じタグのすぐ上が定位置です
    );
};
export default Login;
