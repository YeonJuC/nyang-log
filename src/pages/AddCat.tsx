import { useState } from 'react';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom'; // ✅ 추가
import { collection, addDoc } from 'firebase/firestore';

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

const AddCat = () => {
  const navigate = useNavigate(); // ✅ 추가
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [species, setSpecies] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('ch_1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      const catRef = await addDoc(collection(db, 'users', user.uid, 'cats'), {
        nickname,
        age,
        species,
        profileImage: selectedCharacter,
        createdAt: new Date(),
      });
  
      const newCatId = catRef.id; // 추가된 고양이 ID 얻기
  
      // ✅ 고양이 추가하고 바로 리스트 새로 불러오기 + 새로 추가된 고양이 선택
      await refreshProfileAndCats(newCatId);
  
      alert('고양이 추가 완료!');
      navigate('/home'); // ✅ 추가 후 홈으로 이동
  
    } catch (error) {
      console.error('고양이 추가 오류:', error);
    }
  };
  

  function handleCancel(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    // 취소 버튼 누르면 홈으로 이동하는 로직 추가
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-12 px-6">
      {/* ✅ pt-12로 상단 패딩만 주고, 중앙이 아니라 상단에 배치 */}
      <h1 className="text-2xl font-apple_bigbold mb-6 text-[#3958bd]">반려묘 추가하기</h1>

      {/* ✅ 선택한 캐릭터 크게 보여주기 */}
      <div className="mb-6">
        <img
          src={characterImages[selectedCharacter]}
          alt="선택된 캐릭터"
          className="w-32 h-32"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-xs">
        <div className="flex space-x-2 overflow-x-auto mb-4">
          {Object.keys(characterImages).map((charKey) => (
            <button
              key={charKey}
              type="button"
              onClick={() => setSelectedCharacter(charKey)}
              className={`p-1 rounded-full border-2 ${
                selectedCharacter === charKey ? 'border-[#3958bd]' : 'border-transparent'
              }`}
            >
              <img
                src={characterImages[charKey]}
                alt={charKey}
                className="w-14 h-14 object-cover rounded-full"
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
          추가하기
        </button>

        {/* ✅ 취소 버튼 추가 */}
        <button
          type="button"
          onClick={handleCancel}
          className="w-full bg-gray-300 text-gray-700 py-3.5 rounded-full font-semibold text-base"
        >
          취소
        </button>
      </form>
    </div>
  );
};

export default AddCat;
function refreshProfileAndCats(newCatId: string) {
  throw new Error('Function not implemented.');
}

