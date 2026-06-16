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
  const [step, setStep] = useState(1);
  const [quizInput, setQuizInput] = useState("");
  const [reasonInput, setReasonInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [escapeCount, setEscapeCount] = useState(0);
  const [btnTranslate, setBtnTranslate] = useState({ x: 0, y: 0 });

  const navigate = useNavigate();
  const auth = getAuth();

  // 💡 管理画面の設定を読み込む（未設定ならデフォルト値）
  const maxEscape = localStorage.getItem("admin_max_escape") !== null ? Number(localStorage.getItem("admin_max_escape")) : 10;
  const quizAnswer = localStorage.getItem("admin_quiz_answer") || "ゆきどこ";

  // マウスホバーで逃げる関数
  const handleButtonEscape = () => {
    if (step === 1) {
      if (escapeCount < maxEscape) {
        const randomX = (Math.random() - 0.5) * 300;
        const randomY = (Math.random() - 0.5) * 150;
        setBtnTranslate({ x: randomX, y: randomY });
        setEscapeCount((prev) => {
          const nextCount = prev + 1;
          // 💡 逃げたことを管理画面に密告
          window.dispatchEvent(new CustomEvent("app_log_event", {
            detail: { type: "INFO", text: `ユーザーが退会ボタンに接近！ボタンが逃げました（通算 ${nextCount} 回目）` }
          }));
          return nextCount;
        });
      } else {
        setBtnTranslate({ x: 0, y: 0 });
        // 💡 諦めたことを密告
        window.dispatchEvent(new CustomEvent("app_log_event", {
          detail: { type: "WARN", text: `退会ボタンが降伏しました。ボタンが中央にとどまっています。` }
        }));
      }
    }
  };

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

  const RenderActionButtons = ({ nextAction, isDeleteDisabled = false }: { nextAction: () => void, isDeleteDisabled?: boolean }) => {
    return (
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} px={2}>
        {/* 🔴 左側：赤地に白文字で「マイページに戻る」 */}
        <Button
          variant="contained"
          onClick={() => {
            // 💡 トラップに引っかかったことを管理画面に密告
            window.dispatchEvent(new CustomEvent("app_log_event", {
              detail: { type: "WARN", text: `ユーザーがトラップ赤ボタンを踏み、マイページに強制送還されました！ザマァ！` }
            }));
            navigate("/Mypage");
          }}
          // 〜以下、sx 属性などはそのまま〜
          sx={{
            backgroundColor: "#ff0000",
            color: "#ffffff",
            fontWeight: "bold",
            borderRadius: 2,
            padding: "8px 20px",
            '&:hover': { backgroundColor: "#cc0000" }
          }}
        >
          マイページに戻る
        </Button>

        <Button
          variant="text"
          color="primary"
          disabled={isDeleteDisabled}
          onClick={nextAction}
          sx={{
            textDecoration: "underline",
            fontSize: "0.9rem",
            fontWeight: "bold"
          }}
        >
          アカウントを削除する
        </Button>
      </Box>
    );
  };

  return (
    <Container>
      <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: "80vh" }}>
        <Grid item xs={12} sm={8} md={6}>
          <Paper elevation={6} sx={{ padding: 4, borderRadius: 4, textAlign: "center", position: "relative", overflow: "hidden" }}>
            
            <Typography sx={{ fontSize: 60, mb: 2 }}>💔</Typography>

            {/* 第1段階：最初の逃げるボタン */}
            {step === 1 && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: "#ff4d6d", mb: 2 }}>
                  え…？ やだ、別れたくないッ…！
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                  {escapeCount < maxEscape 
                    ? `ボタンを押せるものなら押してみてよ！(回避: ${escapeCount}/${maxEscape})` 
                    : "うぅ…執念に負けたよ……。お、押せばいいじゃん……。"}
                </Typography>
                
                <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
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

            {/* 第2段階：無理難題クイズ */}
            {step === 2 && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: "#ff4d6d", mb: 2 }}>
                  第2関門：私たちの愛の証明
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  ゆきどこを捨てるなんて許さないんだから！<br />
                  悔しかったら、このアプリの名前を**寸分の狂いなく「{quizAnswer}」**で入力してよね！
                </Typography>
                
                <TextField
                  label="クイズの答えは？"
                  fullWidth
                  variant="outlined"
                  value={quizInput}
                  onChange={(e) => setQuizInput(e.target.value)}
                  placeholder="ここに入力"
                  sx={{ mb: 1 }}
                />

                {/* 共通ボタン（10文字以上で右側の削除ボタンが活性化） */}
                <RenderActionButtons 
                  nextAction={() => {
                    // 💡 必死に書いた作文の内容を管理画面に盗み見させるログ
                    window.dispatchEvent(new CustomEvent("app_log_event", {
                      detail: { type: "LOVE", text: `愛の作文を傍受（${reasonInput.length}文字）: 「${reasonInput}」` }
                    }));
                    setDialogOpen(true);
                  }} 
                  isDeleteDisabled={reasonInput.length < 10} 
                />
              </Box>
            )}

            {/* 第3段階：作文の強要 */}
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

                <Typography variant="caption" display="block" sx={{ mb: 1, color: reasonInput.length >= 10 ? "green" : "red" }}>
                  現在の文字数: {reasonInput.length}文字 / 10文字以上必要
                </Typography>

                <RenderActionButtons 
                  nextAction={() => setDialogOpen(true)} 
                  isDeleteDisabled={reasonInput.length < 10} 
                />
              </Box>
            )}

          </Paper>
        </Grid>
      </Grid>

      {/* 第4段階：最終確認ポップアップ */}
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
        <DialogActions style={{ padding: '16px 24px', justifyContent: 'center', gap: 20 }}>
          <Button 
            onClick={() => setDialogOpen(false)} 
            variant="contained" 
            sx={{ 
              borderRadius: 2, 
              padding: "8px 24px", 
              backgroundColor: "#ff0000",
              color: "#ffffff",
              fontWeight: "bold",
              '&:hover': { backgroundColor: "#cc0000" }
            }}
          >
            マイページに戻る
          </Button>
          <Button 
            onClick={handleDeleteFinal} 
            sx={{ 
              borderRadius: 1, 
              fontSize: "0.6rem", 
              padding: "2px 6px",  
              minWidth: "auto",
              color: "#aaaaaa",    
              backgroundColor: "#f5f5f5", 
              '&:hover': { backgroundColor: "#e0e0e0", color: "#888888" }
            }}
          >
            消す。
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Drop;
