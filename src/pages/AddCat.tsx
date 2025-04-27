import { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

import ch_1 from '../img/ch_1.png';
import ch_2 from '../img/ch_2.png';
import ch_3 from '../img/ch_3.png';
import ch_4 from '../img/ch_4.png';
import ch_5 from '../img/ch_5.png';
import ch_6 from '../img/ch_6.png';

const profileImages: Record<string, string> = {
    ch_1,
    ch_2,
    ch_3,
    ch_4,
    ch_5,
    ch_6,
  };
  

const AddCat = () => {
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [species, setSpecies] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('ch_1'); // ✅

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'cats'), {
        nickname,
        age,
        species,
        profileImage: selectedCharacter,
        createdAt: new Date(),
      });
      alert('고양이 추가 완료!');
    } catch (error) {
      console.error('고양이 추가 오류:', error);
    }
  };

  return (
    <div className="flex flex-col max-w-md mx-auto p-8 space-y-4">
      <h2 className="text-2xl font-bold text-center mb-4">고양이 프로필 추가</h2>
      <input
        placeholder="이름"
        value={nickname}   // ✅ 여기
        onChange={(e) => setNickname(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        placeholder="나이"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        placeholder="종"
        value={species}
        onChange={(e) => setSpecies(e.target.value)}
        className="border p-2 rounded"
      />

      {/* 프로필 사진 선택 */}
      <div className="flex space-x-4 overflow-x-auto">
        {Object.keys(profileImages).map((key) => (
          <img
          key={key}
          src={profileImages[key]}
          alt={key}
          className={`w-16 h-16 rounded-full cursor-pointer ${
            selectedCharacter === key ? 'ring-4 ring-blue-400' : ''
          }`}
          onClick={() => setSelectedCharacter(key)}
        />        
        ))}
      </div>

      <button
        onClick={handleSubmit}   // ✅ 여기
        className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mt-6"
      >
        고양이 추가하기
      </button>
    </div>
  );
};

export default AddCat;
