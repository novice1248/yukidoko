import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Box, Button, Container, Grid, TextField, Typography, Paper, Snackbar, Alert } from "@mui/material";

export const Register: React.FC = () => {
    const [registerIdOrEmail, setRegisterIdOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const navigate = useNavigate();
    
    // 通知（スナックバー）用ステート
    const [open, setOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "info">("info");

    const auth = getAuth();

    // 💡 新規登録処理のハンドラー
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!registerIdOrEmail || !password || !displayName.trim()) {
            setAlertMessage("すべての項目を入力してください。");
            setAlertSeverity("error");
            setOpen(true);
            return;
        }

        if (password.length < 6) {
            setAlertMessage("パスワードは6文字以上で入力してください。");
            setAlertSeverity("error");
            setOpen(true);
            return;
        }

        let finalEmail = registerIdOrEmail.trim();

        // 💡 入力された値に「@」が含まれていない場合は「ユーザーID」として処理
        if (!finalEmail.includes("@")) {
            // ログイン画面（Login.tsx）と完全に一致するダミードメインを結合
            finalEmail = `${finalEmail}@yukidoko.local`;
        }

        try {
            // 1. Firebase Auth にアカウント（疑似メールアドレス or 本物メールアドレス）を作成
            const userCredential = await createUserWithEmailAndPassword(auth, finalEmail, password);
            
            // 2. アカウント作成に成功したら、同時に入力された「表示名」をプロフィールに登録
            if (userCredential.user) {
                await updateProfile(userCredential.user, {
                    displayName: displayName.trim()
                });
            }

            setAlertMessage("アカウントの登録が完了しました！");
            setAlertSeverity("success");
            setOpen(true);
            
            // 💡 登録完了後、1秒待って自動的にマイページまたはホームへ移動
            setTimeout(() => navigate("/Mypage"), 1000);

        } catch (error: any) {
            console.error(error);
            // エラー原因に応じたメッセージ分岐
            if (error.code === "auth/email-already-in-use") {
                setAlertMessage("このユーザーIDまたはメールアドレスは既に登録されています。");
            } else if (error.code === "auth/invalid-email") {
                setAlertMessage("使用できない文字が含まれているか、形式が正しくありません。");
            } else {
                setAlertMessage("アカウント登録に失敗しました。時間をおいて再度お試しください。");
            }
            setAlertSeverity("error");
            setOpen(true);
        }
    };

    return (
        <Container>
            <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: "80vh" }}>
                <Grid item xs={12} sm={8} md={6}>
                    <Paper elevation={3} sx={{ padding: 4, borderRadius: 4 }}>
                        <Box component="form" onSubmit={handleRegisterSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                                ❄️ 新規アカウント登録
                            </Typography>

                            {/* 表示名（ニックネーム）入力欄 */}
                            <TextField 
                                label="表示名（アプリ内で公開される名前）" 
                                variant="outlined" 
                                value={displayName} 
                                onChange={(e) => setDisplayName(e.target.value)} 
                                placeholder="例: たかし"
                                fullWidth 
                                required 
                            />

                            {/* ユーザーID または メールアドレス 入力欄 */}
                            <TextField 
                                label="希望するユーザーID または メールアドレス" 
                                variant="outlined" 
                                value={registerIdOrEmail} 
                                onChange={(e) => setRegisterIdOrEmail(e.target.value)} 
                                placeholder="お好みのID、またはメールアドレス"
                                fullWidth 
                                required 
                            />

                            {/* パスワード入力欄 */}
                            <TextField 
                                label="パスワード（6文字以上）" 
                                variant="outlined" 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                fullWidth 
                                required 
                            />

                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary" 
                                size="large" 
                                sx={{ mt: 2, borderRadius: 2, fontWeight: "bold" }}
                            >
                                アカウントを作成して始める
                            </Button>

                            <Box display="flex" justifyContent="center" mt={1}>
                                <Button 
                                    variant="text" 
                                    color="secondary" 
                                    onClick={() => navigate("/Login")} 
                                    sx={{ fontSize: '0.85rem' }}
                                >
                                    すでにアカウントをお持ちの方（ログインへ）
                                </Button>
                            </Box>
                        </Box>

                        {/* 通知ポップアップ */}
                        <Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                            <Alert severity={alertSeverity} sx={{ width: '100%', borderRadius: 2 }}>{alertMessage}</Alert>
                        </Snackbar>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Register;