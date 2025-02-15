import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, Typography } from "@mui/material";

const Logout = () => {
  const auth = getAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // ログアウト後にログイン画面へ遷移
    } catch (error) {
      console.error("ログアウトに失敗しました", error);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Card style={{ padding: "20px", boxShadow: "0px 4px 6px rgba(0,0,0,0.1)" }}>
        <CardContent style={{ textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>本当にログアウトしますか？</Typography>
          <Button variant="contained" color="error" onClick={handleLogout}>ログアウト</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logout;
