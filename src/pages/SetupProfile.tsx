import { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import ch_1 from '../img/ch_1.png';
import ch_2 from '../img/ch_2.png';
import ch_3 from '../img/ch_3.png';
import ch_4 from '../img/ch_4.png';
import ch_5 from '../img/ch_5.png';
import ch_6 from '../img/ch_6.png';

const characterImages: Record<string, string> = {
  ch_1,
  ch_2,
  ch_3,
  ch_4,
  ch_5,
  ch_6,
};

interface SetupProfileProps {
  uid: string;
  onComplete: () => void;
}

const SetupProfile = ({ uid, onComplete }: SetupProfileProps) => {
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [species, setSpecies] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('ch_1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await setDoc(doc(db, 'users', uid), {
        nickname,
        age,
        species,
        profileImage: selectedCharacter,
        createdAt: new Date(),
      });
      onComplete();
    } catch (error) {
      console.error('프로필 저장 오류:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-12 px-6">
      <h1 className="text-2xl font-apple_bigbold mb-6 text-[#3958bd]">프로필 설정</h1>

      {/* ✅ 선택한 캐릭터 크게 보여주기 */}
      <div className="mb-6">
        <img
          src={characterImages[selectedCharacter]}
          alt="선택된 캐릭터"
          className="w-32 h-32"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-xs">
        <div className="font-apple_bold text-gray-700">캐릭터 선택</div>
        <div className="flex space-x-4 overflow-x-auto mb-6">
          {Object.keys(characterImages).map((charKey) => (
            <button
              key={charKey}
              type="button"
              onClick={() => setSelectedCharacter(charKey)}
              className={`w-16 h-16 flex items-center justify-center rounded-full border-4 ${
                selectedCharacter === charKey ? 'border-[#3958bd]' : 'border-gray-300'
              }`}
            >
              <img
                src={characterImages[charKey]}
                alt={charKey}
                className="w-full h-full object-cover rounded-full"
              />
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-gray-400 text-sm block mb-1">반려묘 이름</label>
            <input
              placeholder="반려묘 이름"
              className="w-full border p-2 rounded text-sm"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">반려묘 나이</label>
            <input
              type="number"
              placeholder="반려묘 나이"
              className="w-full border p-2 rounded text-sm"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">반려묘 종</label>
            <input
              placeholder="반려묘 종"
              className="w-full border p-2 rounded text-sm"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#3958bd] text-white py-3.5 rounded-full font-semibold text-base mt-6"
        >
          시작하기
        </button>
      </form>
    </div>
  );
};

export default SetupProfile;
