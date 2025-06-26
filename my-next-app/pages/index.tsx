import React from 'react';
import Header from '../components/Header';

export default function Home() {
  return (
    <div style={{ paddingTop: 70 }}>
      <Header />
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        Home 화면입니다.
      </div>
    </div>
  );
} 