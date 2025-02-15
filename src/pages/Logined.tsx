import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

function Logined() {
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

  if (!user) {
    return <p>認証情報を確認しています...</p>; // ログイン状態確認中の表示
  }

  return (
    <div>
      <h2>ログイン中</h2>
      <p>「ゆきどこ」は、除雪されている道をみんなで情報共有するサイトです。</p>
    </div>
  );
}

export default Logined;
