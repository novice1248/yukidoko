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
  
  // 💡 ボタンが逃げた回数を記録するカウンター
  const [escapeCount, setEscapeCount] = useState(0);
  
  // 最初の画面でボタンが逃げる位置
  const [btnTranslate, setBtnTranslate] = useState({ x: 0, y: 0 });

  const navigate = useNavigate();
  const auth = getAuth();

  // 💡 マウスが乗ったらボタンがランダムに逃げる関数（10回限定）
  const handleButtonEscape = () => {
    if (step === 1) {
      if (escapeCount < 10) {
        // 10回未満なら全力で逃げる！
        const randomX = (Math.random() - 0.5) * 300;
        const randomY = (Math.random() - 0.5) * 150;
        setBtnTranslate({ x: randomX, y: randomY });
        setEscapeCount((prev) => prev + 1); // カウントを1増やす
      } else {
        // 10回逃げ切ったら、座標を真ん中(0,0)に戻してもう逃げない
        setBtnTranslate({ x: 0, y: 0 });
      }
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

  // 第2・第3関門の共通フッターボタン
  const RenderActionButtons = ({ nextAction, isDeleteDisabled = false }: { nextAction: () => void, isDeleteDisabled?: boolean }) => {
    return (
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} px={2}>
        <Button
          variant="contained"
          onClick={() => navigate("/Mypage")}
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

            {/* ==================== 第1段階：最初の逃げるボタン ==================== */}
            {step === 1 && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: "#ff4d6d", mb: 2 }}>
                  え…？ やだ、別れたくないッ…！
                </Typography>
                
                {/* 💡 あと何回逃げるかをそれとなく教えてあげる煽り文句 */}
                <Typography variant="body1" sx={{ mb: 4 }}>
                  {escapeCount < 10 
                    ? `ボタンを押せるものなら押してみてよ！(回避: ${escapeCount}/10)` 
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
                  sx={{ mb: 1 }}
                />

                <RenderActionButtons 
                  nextAction={() => setStep(3)} 
                  isDeleteDisabled={quizInput !== "ゆきどこ"} 
                />
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
    </Container>
  );
};

export default Drop;
