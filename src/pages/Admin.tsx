import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; // 💡 Firebase Authを導入
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  Grid,
  Slider,
  Divider,
} from "@mui/material";

interface LogItem {
  time: string;
  type: "INFO" | "WARN" | "SYSTEM" | "LOVE";
  text: string;
}

export const Admin: React.FC = () => {
  const [emailInput, setEmailInput] = useState(""); // 💡 IDからメールアドレス入力へ変更
  const [passwordInput, setPasswordInput] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [actualSnowCount, setActualSnowCount] = useState<number>(Number(localStorage.getItem("admin_snow_count")) || 80);
  const [sliderSnowCount, setSliderSnowCount] = useState<number>(Number(localStorage.getItem("admin_snow_count")) || 80);
  const [maxEscape, setMaxEscape] = useState<number>(localStorage.getItem("admin_max_escape") !== null ? Number(localStorage.getItem("admin_max_escape")) : 10);
  const [quizAnswer, setQuizAnswer] = useState<string>(localStorage.getItem("admin_quiz_answer") || "ゆきどこ");
  const [logs, setLogs] = useState<LogItem[]>([]);

  const navigate = useNavigate();
  const auth = getAuth(); // 💡 Firebase Authインスタンスの取得

  // 🔒 ログイン認証（安全なバックエンド・FirebaseAuth認証へ変更）
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. まずFirebaseで認証（アカウントが存在し、パスワードが合っているか）
      const userCredential = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
      
      // 💡 2. ログインした人のメールアドレスが、自分の決めた管理者用アドレスかチェック！
      if (userCredential.user.email === "admin@yukidoko.com") { // 👈 ここに管理者アドレスを指定
        setIsAdmin(true);
        setErrorMsg("");
        addLog("SYSTEM", "管理画面デバッグセッションが開始されました。");
      } else {
        // 一般ユーザーだったら、ログアウトさせて突き返す
        await auth.signOut();
        setErrorMsg("一般ユーザーは神の領域に立ち入ることはできません。");
      }
    } catch (error: any) {
      setErrorMsg("メールアドレスまたはパスワードが違います。");
    }
  };

  const handleSliderChange = (_e: Event, newValue: number | number[]) => {
    setSliderSnowCount(newValue as number);
  };

  const addLog = (type: LogItem["type"], text: string) => {
    const newLog: LogItem = {
      time: new Date().toLocaleTimeString(),
      type,
      text,
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 100));
  };

  // 💡 【重要】アプリ内の他画面から飛んでくる本物のイベントログをキャッチする
  useEffect(() => {
    const handleIncomingLog = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: LogItem["type"]; text: string }>;
      if (customEvent.detail) {
        addLog(customEvent.detail.type, customEvent.detail.text);
      }
    };

    window.addEventListener("app_log_event", handleIncomingLog);
    
    // 🚪 画面から離れた（コンポーネントがアンマウントされた）ときの処理
    return () => {
      window.removeEventListener("app_log_event", handleIncomingLog);
      
      // 💡 他の画面に遷移した瞬間に、Firebaseのセッションも確実に切断（自動ログアウト）
      auth.signOut();
      console.log("管理画面から離れたため、安全に自動ログアウトしました。");
    };
  }, [auth]); // 💡 依存配列に auth を追加

  const applySnowSettings = (value: number) => {
    setActualSnowCount(value);
    setSliderSnowCount(value);
    localStorage.setItem("admin_snow_count", String(value));
    window.dispatchEvent(new Event("admin_settings_changed"));
    addLog("SYSTEM", `天候が変更されました。雪の粒数: ${value}個`);
  };

  const handleMaxEscapeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setMaxEscape(val);
    localStorage.setItem("admin_max_escape", String(val));
    addLog("SYSTEM", `退会ボタンの最大回避数が ${val} 回に変更されました。`);
  };

  const handleQuizAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuizAnswer(val);
    localStorage.setItem("admin_quiz_answer", val);
    addLog("SYSTEM", `退会クイズの正解が「${val}」に変更されました。`);
  };

  const handleGenerateFakePins = () => {
    alert("会津若松駅周辺に幻 of ピンを10個生成しました");
    addLog("INFO", "支配者コマンド: サクラ投稿によりピンを10個生成しました。");
  };

  const handleBarlus = () => {
    if (window.confirm("視界のすべてのピンが灰になります。よろしいですか？")) {
      alert("目がぁ、目がぁ〜〜〜っ！！！");
      addLog("WARN", "支配者コマンド: バルスが実行され、すべてのピンが吹き飛びました。");
    }
  };

  const getLogColor = (type: LogItem["type"]) => {
    switch (type) {
      case "WARN": return "#ff4d6d";
      case "SYSTEM": return "#00bfff";
      case "LOVE": return "#ff00ff";
      default: return "#39ff14";
    }
  };

  return (
    <Container>
      <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: "90vh", mt: 4, mb: 4 }}>
        <Grid item xs={12} sm={10} md={8}>
          <Paper elevation={6} sx={{ padding: 4, borderRadius: 4, textAlign: "center" }}>
            
            {!isAdmin ? (
              <Box component="form" onSubmit={handleLogin} sx={{ maxWidth: 400, mx: "auto" }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: "#333" }}>🛠️ 管理者ログイン</Typography>
                {/* 💡 メールアドレス入力に変更 */}
                <TextField label="管理者メールアドレス" fullWidth variant="outlined" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} sx={{ mb: 2 }} />
                <TextField label="パスワード" type="password" fullWidth variant="outlined" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} sx={{ mb: 2 }} />
                {errorMsg && <Typography variant="body2" color="error" sx={{ mb: 2 }}>{errorMsg}</Typography>}
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ fontWeight: "bold" }}>ログイン</Button>
              </Box>
            ) : (
              <Box textAlign="left">
                <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', color: "#2e7d32", mb: 1 }}>✨ 神の管理画面（デバッグモード） ✨</Typography>
                <Typography variant="body2" align="center" sx={{ mb: 4, color: "#888" }}>※他ページに移動すると自動でログアウトされ、セッションが切れます。</Typography>

                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1976d2", mb: 2 }}>🌨️ 1. 天候・気象コントロール</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>現在の設定: <strong>{actualSnowCount} 個</strong> {sliderSnowCount !== actualSnowCount && <span style={{ color: "#e65100", marginLeft: "8px" }}>(変更中: {sliderSnowCount}個)</span>}</Typography>
                      <Slider value={sliderSnowCount} min={0} max={1000} step={10} onChange={handleSliderChange} valueLabelDisplay="auto" />
                      <Button fullWidth variant="contained" color="primary" onClick={() => applySnowSettings(sliderSnowCount)} sx={{ mt: 1, mb: 2, fontWeight: "bold" }}>天候を適用する</Button>
                      <Box display="flex" gap={1}>
                        <Button size="small" variant="outlined" fullWidth onClick={() => applySnowSettings(0)}>無雪にする</Button>
                        <Button size="small" variant="outlined" color="warning" fullWidth onClick={() => applySnowSettings(1000)}>大豪雪にする</Button>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#cc0000", mb: 2 }}>💔 2. 退会画面（Drop）のメンヘラ度調整</Typography>
                      <TextField label="ボタンが逃げる回数" type="number" size="small" fullWidth value={maxEscape} onChange={handleMaxEscapeChange} sx={{ mb: 2 }} />
                      <TextField label="第2関門のクイズの正解" size="small" fullWidth value={quizAnswer} onChange={handleQuizAnswerChange} />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#e65100", mb: 2 }}>🗺️ 3. マップデータ支配</Typography>
                      <Box display="flex" flexDirection="column" gap={2}>
                        <Button variant="contained" color="warning" onClick={handleGenerateFakePins}>サクラ投稿（幻のピンを10個生成）</Button>
                        <Button variant="contained" style={{ backgroundColor: "#000", color: "#fff" }} onClick={handleBarlus}>バルス（全ピン一斉爆破）</Button>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: "#1e1e1e", color: "#39ff14", height: "100%" }}>
                      <Typography variant="subtitle2" sx={{ fontFamily: "monospace", mb: 1, color: "#fff" }}>📟 本物のリアルタイムログ監視</Typography>
                      <Box sx={{ fontFamily: "monospace", fontSize: "0.8rem", height: 160, overflowY: "auto", lineHeight: 1.5 }}>
                        {logs.length === 0 ? (
                          <div style={{ color: "#888" }}>[WAIT] ユーザーの行動を待機中...</div>
                        ) : (
                          logs.map((log, index) => (
                            <div key={index} style={{ color: getLogColor(log.type), marginBottom: "2px" }}>
                              [{log.type}] {log.time} {log.text}
                            </div>
                          ))
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />
                <Button variant="contained" color="error" onClick={() => navigate("/Mypage")} fullWidth sx={{ fontWeight: "bold" }}>神の座を降りてマイページに戻る（自動ログアウト）</Button>
              </Box>
            )}

          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Admin;
