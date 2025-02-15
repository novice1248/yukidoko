import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged, User } from "firebase/auth";

const MyPage = () => {
    const navigate = useNavigate();
        const auth = getAuth();
        const [user, setUser] = useState<User | null>(null);
      
        useEffect(() => {
          const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
              navigate("/Login"); // 未ログインならログインページへリダイレクト
            } else {
              setUser(currentUser);
            }
          });
      
          return () => unsubscribe();
        }, [navigate]);
      
        const handleLogout = async () => {
          try {
            await signOut(auth);
            navigate("/"); // ログアウト後にホームへリダイレクト
          } catch (error) {
            console.error("ログアウトエラー:", error);
          }
        };
      
        if (!user) {
          return <p>認証情報を確認しています...</p>; // ログイン状態確認中の表示
        }

  useEffect(() => {
    // サーバーからユーザー情報を取得
    fetch('/api/user') // 仮のAPIエンドポイント
      .then((response) => response.json())
      .then((data) => setUser(data));
  }, []);

  const handlePasswordReset = () => {
    // パスワード再設定のロジック（モーダル表示など）
    alert('パスワード再設定のページに移動します');
  };

  const handleAccountDeletion = () => {
    // アカウント削除のロジック（確認ポップアップなど）
    if (window.confirm('本当にアカウントを削除しますか？')) {
      alert('アカウント削除処理を実行');
    }
  };

  if (!user) return <div>読み込み中...</div>;

  return (
    <div>
      <h1>マイページ</h1>
      <p>メールアドレス: {user.email}</p>
      <button onClick={handlePasswordReset}>パスワード再設定</button>
      <button onClick={handleAccountDeletion}>アカウント削除</button>
    </div>
  );
};

export default MyPage;
