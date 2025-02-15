import React from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

function Logined() {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // ログアウト後にホームへリダイレクト
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  return (
    <div>
      <h2>ログイン中</h2>
      <p>「ゆきどこ」は、除雪されている道をみんなで情報共有するサイトです。</p>
    </div>
  );
}

export default Logined;
