import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const ResetLogin = () => {
  const [email, setEmail] = useState(""); // ユーザーが入力するメールアドレス
  const [message, setMessage] = useState(""); // 成功メッセージ
  const [error, setError] = useState(""); // エラーメッセージ
  const navigate = useNavigate();
  const auth = getAuth();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      // メールアドレスが登録されているか確認
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length === 0) {
        throw new Error("auth/user-not-found"); // ユーザーが存在しない場合のエラーを手動で発生
      }

      // ユーザーが存在する場合、パスワードリセットメールを送信
      await sendPasswordResetEmail(auth, email);
      setMessage("パスワードリセットのメールを送信しました。");
    } catch (error: any) {
      // エラーハンドリング
      if (error.message === "auth/user-not-found") {
        setError("このメールアドレスは登録されていません。");
      } else if (error.code === "auth/invalid-email") {
        setError("無効なメールアドレスです。");
      } else {
        setError("エラーが発生しました。もう一度お試しください。");
      }
    }
  };

  return (
    <div>
      <h1>パスワード再設定</h1>
      <form onSubmit={handleResetPassword}>
        <input
          type="email"
          placeholder="登録しているメールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">送信</button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={() => navigate("/login")}>ログインページに戻る</button>
    </div>
  );
};

export default ResetLogin;
