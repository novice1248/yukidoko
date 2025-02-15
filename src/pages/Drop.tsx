import { useEffect, useState } from "react";
import { getAuth, deleteUser, onAuthStateChanged, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Drop = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

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
        alert("エラーが発生しました。再度お試しください。");
      }
    }
  };

  if (!user) {
    return <p>認証情報を確認しています...</p>;
  }

  return (
    <div>
      <h1>アカウント削除</h1>
      <p>アカウントを削除する場合は、下のボタンを押してください。</p>
      <button onClick={handleAccountDeletion}>アカウント削除</button>
    </div>
  );
};

export default Drop;
