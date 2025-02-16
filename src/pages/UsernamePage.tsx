import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeApp, getApp } from 'firebase/app'; // Adjust the path as necessary

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const UsernamePage = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // ログイン状態を監視し、ユーザー情報をセット
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);  // ユーザー情報を取得
      } else {
        setUser(null);
        navigate('/');  // 未ログインならログインページにリダイレクト
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('ログインしてください');
      return;
    }

    if (!username) {
      setError('ユーザーネームを入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Firestore に uid をキーとしてデータを保存
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,  // ユーザーの UID
        username,  // 入力されたユーザー名
      });

      console.log('データが保存されました:', { uid: user.uid, username });

      // 入力フィールドをクリア
      setUsername('');
    } catch (error) {
      setError('エラーが発生しました。');
      console.error('保存エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>ユーザーネームを入力</h1>
      {user ? (
        <form onSubmit={handleUsernameSubmit}>
          <div>
            <label htmlFor="username">ユーザーネーム</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? '保存中...' : '確定'}
          </button>
        </form>
      ) : (
        <p>ログインしていません。ログインしてください。</p>
      )}
    </div>
  );
};

export default UsernamePage;
