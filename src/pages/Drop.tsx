import { useEffect, useState } from "react";
import { getAuth, deleteUser, onAuthStateChanged, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Container, Box, Alert } from "@mui/material";

const Drop = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login"); // 未ログインならログインページへリダイレクト
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleAccountDeletion = async () => {
    if (user && window.confirm("本当にアカウントを削除しますか？")) {
      try {
        await deleteUser(user);
        alert("アカウントが削除されました。");
        navigate("/"); // 削除後、ホームへリダイレクト
      } catch (error) {
        setError("エラーが発生しました。再度お試しください。");
      }
    }
  };

  if (!user) {
    return <Typography variant="h6" color="textSecondary">認証情報を確認しています...</Typography>;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 2 }}>
        <Typography variant="h4" sx={{ marginBottom: 2 }}>アカウント削除</Typography>
        <Typography variant="body1" sx={{ marginBottom: 3 }}>
          アカウントを削除する場合は、下のボタンを押してください。
        </Typography>
        
        {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}

        <Button 
          variant="contained" 
          color="error" 
          onClick={handleAccountDeletion}
          sx={{ padding: "10px 20px", fontSize: "1rem" }}
        >
          アカウント削除
        </Button>
      </Box>
    </Container>
  );
};

export default Drop;
