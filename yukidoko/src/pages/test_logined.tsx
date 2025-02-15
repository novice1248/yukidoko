import React from 'react';

const GoBackPage = () => {
  const goBack = () => {
    window.history.back();
  };

  return (
    <div>
      <button onClick={goBack}>前のページに戻る</button>
    </div>
  );
};

export default GoBackPage;
