// src/pages/SetupProfile.tsx
import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface SetupProfileProps {
    uid: string;
    onComplete: () => void;
  }
  
  const SetupProfile = ({ uid, onComplete }: SetupProfileProps) => {
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [age, setAge] = useState('');
    const [species, setSpecies] = useState('');
    
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      try {
        await setDoc(doc(db, 'users', uid), {
          name,
          nickname,
          age,
          species,
          createdAt: new Date(),
        });
  
        onComplete(); // 🔥 이 부분이 중요
      } catch (error) {
        console.error('프로필 저장 오류:', error);
      }
    };
  
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-apple_bigbold mb-6 text-[#3958bd]">프로필 설정</h1>
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-xs">
          <div className="font-apple_bold">보호자 이름</div>
          <input placeholder="보호자 이름을 입력해주세요." className="w-full border p-2 rounded" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="font-apple_bold">반려묘 이름</div>
          <input placeholder="반려묘 이름을 입력해주세요." className="w-full border p-2 rounded" value={nickname} onChange={(e) => setNickname(e.target.value)} required />
          <div className="font-apple_bold">반려묘 나이</div>
          <input placeholder="반려묘 나이를 입력해주세요.(숫자만)" type="number" className="w-full border p-2 rounded" value={age} onChange={(e) => setAge(e.target.value)} required />
          <div className="font-apple_bold">반려묘 종</div>
          <input placeholder="반려묘 종을 입력해주세요." className="w-full border p-2 rounded" value={species} onChange={(e) => setSpecies(e.target.value)} required />
          <button type="submit" className="w-full bg-[#3958bd] text-white py-2 rounded font-semibold">
            시작하기
          </button>
        </form>
      </div>
    );
  };
  
  export default SetupProfile;
  