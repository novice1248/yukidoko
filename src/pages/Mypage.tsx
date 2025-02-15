import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

const MyPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    // Firebaseの認証状態を監視
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login"); // 未ログインならログインページへリダイレクト
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  if (loading) return <div>認証情報を確認しています...</div>;

  // Googleでログインしているか確認
  const isGoogleLogin = user?.providerData.some((provider) => provider.providerId === "google.com");

  return (
    <div>
      <h1>マイページ</h1>
      <p>
        メールアドレス:{" "}
        {isGoogleLogin ? "Googleでログイン中" : user?.email || "登録されていません"}
      </p>
      <button onClick={() => navigate("/ResetLogin")}>パスワード再設定</button>
      <button onClick={() => navigate("/Drop")}>アカウント削除</button>
    </div>
  );
};

export default MyPage;
