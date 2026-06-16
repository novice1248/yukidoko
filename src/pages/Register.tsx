import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";
import { Box, Button, Container, Grid, TextField, Typography, Paper, Snackbar, Alert } from "@mui/material";

export const Register: React.FC = () => {
    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info">("info");

    const auth = getAuth();

    const handleRegister = async () => {
        if (!email.trim() || !displayName.trim()) {
            setAlertMessage("表示名とメールアドレスを入力してください。");
            setAlertSeverity("error");
            setOpen(true);
            return;
        }

        // 💡 メールのリンクをクリックした時の戻り先URL（/SetPassword）を指定
        const actionCodeSettings = {
            url: window.location.origin + '/yukidoko/SetPassword',
            handleCodeInApp: true,
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            
            // 💡 リンクを踏んだ時に照合できるよう、ブラウザにメアドと名前を一時保存
            window.localStorage.setItem("emailForSignIn", email);
            window.localStorage.setItem("displayNameForSignIn", displayName);

            setAlertMessage("確認メールを送信しました！メール内のリンクを開いてパスワードを設定してください。");
            setAlertSeverity("success");
            setOpen(true);
        } catch (error: any) {
            console.error(error);
            setAlertMessage("エラーが発生しました。メールアドレスが正しいか確認してください。");
            setAlertSeverity("error");
            setOpen(true);
        }
    };

    return (
        <Container>
            <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: "80vh" }}>
                <Grid item xs={12} sm={8} md={6}>
                    <Paper elevation={3} sx={{ padding: 4, borderRadius: 4 }}>
                        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                            アカウント新規登録
                        </Typography>
                        <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField label="表示名（ニックネーム）" variant="outlined" value={displayName} onChange={(e) => setDisplayName(e.target.value)} fullWidth required />
                            <TextField label="メールアドレス" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />

                            <Button variant="contained" color="primary" size="large" onClick={handleRegister} sx={{ mt: 1, borderRadius: 2 }}>
                                確認メールを送信する
                            </Button>
                            <Button variant="text" color="inherit" onClick={() => navigate("/login")}>
                                すでにアカウントをお持ちの方はこちら（ログイン）
                            </Button>
                        </Box>
                        <Snackbar open={open} autoHideDuration={5000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                            <Alert severity={alertSeverity} sx={{ width: '100%', borderRadius: 2 }}>{alertMessage}</Alert>
                        </Snackbar>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Register;
