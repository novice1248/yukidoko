// UsernamePage.tsx
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const UsernamePage = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username) {
      setError('ユーザーネームを入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Firestoreにユーザーネームを保存
      const docRef = await addDoc(collection(db, 'usernames'), {
        username,
      });

      // 保存が成功した場合、コンソールに結果を表示
      console.log('ユーザーネームが保存されました。ID:', docRef.id);

      // 入力後にフィールドをクリア
      setUsername('');
    } catch (error) {
      // エラーハンドリング
      setError('エラーが発生しました。');
      console.error('保存エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>ユーザーネームを入力</h1>
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
    </div>
  );
};

export default UsernamePage;
