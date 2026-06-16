import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, deleteUser } from "firebase/auth";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export const Drop: React.FC = () => {
  const [step, setStep] = useState(1); // 何段階目の確認か
  const [quizInput, setQuizInput] = useState("");
  const [reasonInput, setReasonInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // ボタンが逃げる位置（おふざけ用）
  const [btnTranslate, setBtnTranslate] = useState({ x: 0, y: 0 });

  const navigate = useNavigate();
  const auth = getAuth();

  // マウスが乗ったらボタンがランダムに逃げる関数
  const handleButtonEscape = () => {
    if (step === 1) {
      const randomX = (Math.random() - 0.5) * 300;
      const randomY = (Math.random() - 0.5) * 150;
      setBtnTranslate({ x: randomX, y: randomY });
    }
  };

  // 実際の削除処理
  const handleDeleteFinal = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await deleteUser(user);
      alert("…本当に消しちゃったんだ。あなたのこと、忘れないからね……。");
      navigate("/home");
    } catch (error) {
      alert("エラーだって。神様も別れるなって言ってるんだよ（再ログインしてみてね）");
      setDialogOpen(false);
    }
  };

  return (
    <Container>
      <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: "80vh" }}>
        <Grid item xs={12} sm={8} md={6}>
          <Paper elevation={6} sx={{ padding: 4, borderRadius: 4, textAlign: "center", position: "relative", overflow: "hidden" }}>
            
            {/* アイコンの代わりに絵文字 */}
            <Typography sx={{ fontSize: 60, mb: 2 }}>💔</Typography>

            {/* ==================== 第1段階：ボタンが逃げる ==================== */}
            {step === 1 && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: "#ff4d6d", mb: 2 }}>
                  え…？ やだ、別れたくないッ…！
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                  ボタンを押せるものなら押してみてよ！
                </Typography>
                
                <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                  {/* 🔴 押してほしい（進んでほしい）ボタンを真っ赤に */}
                  <Button
                    variant="contained"
                    onMouseEnter={handleButtonEscape}
                    onClick={() => setStep(2)}
                    sx={{
                      transform: `translate(${btnTranslate.x}px, ${btnTranslate.y}px)`,
                      transition: "transform 0.1s ease",
                      position: "absolute",
                      backgroundColor: "#ff0000",
                      '&:hover': { backgroundColor: "#cc0000" }
                    }}
                  >
                    アカウントを削除
                  </Button>
                </Box>
              </Box>
            )}

            {/* ==================== 第2段階：無理難題クイズ ==================== */}
            {step === 2 && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: "#ff4d6d", mb: 2 }}>
                  第2関門：私たちの愛の証明
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  ゆきどこを捨てるなんて許さないんだから！<br />
                  悔しかったら、このアプリの名前を**寸分の狂いなくひらがな**で入力してよね！
                </Typography>
                
                <TextField
                  label="アプリの名前は？"
                  fullWidth
                  variant="outlined"
                  value={quizInput}
                  onChange={(e) => setQuizInput(e.target.value)}
                  placeholder="ここにひらがなで入力"
                  sx={{ mb: 3 }}
                />

                {/* 🔴 活性化したら真っ赤になるボタン */}
                <Button
                  variant="contained"
                  disabled={quizInput !== "ゆきどこ"}
                  onClick={() => setStep(3)}
                  fullWidth
                  sx={{
                    backgroundColor: quizInput === "ゆきどこ" ? "#ff0000" : "#ccc",
                    '&:hover': { backgroundColor: quizInput === "ゆきどこ" ? "#cc0000" : "#ccc" }
                  }}
                >
                  あってるか確認する
                </Button>
              </Box>
            )}

            {/* ==================== 第3段階：作文の強要 ==================== */}
            {step === 3 && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: "#ff4d6d", mb: 2 }}>
                  最後のお願い：別れの作文
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  どうしても消すっていうなら、ゆきどこの好きなところを<br />
                  **10文字以上**で熱く語ってから去ってよね！
                </Typography>
                
                <TextField
                  label="ゆきどこへの愛のメッセージ"
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="ゆきどこのここがめっちゃ好き！など"
                  sx={{ mb: 3 }}
                />

                <Typography variant="caption" display="block" sx={{ mb: 2, color: reasonInput.length >= 10 ? "green" : "red" }}>
                  現在の文字数: {reasonInput.length}文字 / 10文字以上必要
                </Typography>

                {/* 🔴 活性化したら真っ赤になるボタン */}
                <Button
                  variant="contained"
                  disabled={reasonInput.length < 10}
                  onClick={() => setDialogOpen(true)}
                  fullWidth
                  sx={{
                    backgroundColor: reasonInput.length >= 10 ? "#ff0000" : "#ccc",
                    '&:hover': { backgroundColor: reasonInput.length >= 10 ? "#cc0000" : "#ccc" }
                  }}
                >
                  涙をのんでサヨナラする
                </Button>
              </Box>
            )}

            {/* 共通の「やっぱり戻る」ボタン（ここは優しさで青いまま） */}
            <Box mt={4}>
              <Button variant="text" color="primary" onClick={() => navigate("/Mypage")}>
                やっぱり別れない！（マイページに戻る）
              </Button>
            </Box>

            {/* ==================== 第4段階：最終確認ポップアップ ==================== */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
              <DialogTitle style={{ fontWeight: 'bold', color: '#ff4d6d', textAlign: 'center' }}>
                最後の最後だよ？
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  本当に、本当に消しちゃうの？<br />
                  ここで「はい」を押したら、もう二度と会えなくなっちゃうんだからね……？
                </DialogContentText>
              </DialogContent>
              <DialogActions style={{ padding: '16px 24px', justifyContent: 'center', gap: 20, position: 'relative' }}>
                
                {/* 🔴 アカウント削除をやめる（引き止める）ボタンを、一番大きな「真っ赤なボタン」に！ */}
                <Button 
                  onClick={() => setDialogOpen(false)} 
                  variant="contained" 
                  sx={{ 
                    borderRadius: 20, 
                    padding: "10px 30px", 
                    fontSize: "1.1rem",
                    backgroundColor: "#ff0000",
                    '&:hover': { backgroundColor: "#cc0000" }
                  }}
                >
                  やっぱりやめる！
                </Button>

                {/* 👻 本当の「消す。」ボタンは、背景と同化しそうな「極小のグレー」に！ */}
                <Button 
                  onClick={handleDeleteFinal} 
                  sx={{ 
                    borderRadius: 1, 
                    fontSize: "0.6rem", // めっちゃ小さい
                    padding: "2px 6px",  // めっちゃ細い
                    minWidth: "auto",
                    color: "#aaaaaa",    // 背景の白に近い薄いグレー
                    backgroundColor: "#f5f5f5", 
                    '&:hover': { 
                      backgroundColor: "#e0e0e0",
                      color: "#888888"
                    }
                  }}
                >
                  消す。
                </Button>

              </DialogActions>
            </Dialog>

          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Drop;
