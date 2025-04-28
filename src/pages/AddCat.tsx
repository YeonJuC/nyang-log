import { useState } from 'react';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { useSelectedCat } from '../utils/SelectedCatContext';

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

interface CatInfo {
  id: string;
  nickname: string;
  age: string;
  species: string;
  profileImage: string;
  createdAt: Date;
}

const AddCat = () => {
  const navigate = useNavigate();
  const { setSelectedCat, setCats, setSelectedCatId } = useSelectedCat();

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

      await refreshProfileAndCats(catRef.id);

      alert('고양이 추가 완료!');
      navigate('/home');

    } catch (error) {
      console.error('고양이 추가 오류:', error);
    }
  };

  const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigate('/home');
  };

  const refreshProfileAndCats = async (newCatId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const catsQuery = query(collection(db, 'users', user.uid, 'cats'), orderBy('createdAt'));
    const catsSnapshot = await getDocs(catsQuery);
    const catsList: CatInfo[] = catsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<CatInfo, 'id'>)
    }));

    setCats(catsList);

    const newlyAddedCat = catsList.find(cat => cat.id === newCatId);
    if (newlyAddedCat) {
      setSelectedCat(newlyAddedCat);
      setSelectedCatId(newCatId);  // ✅ 여기서 추가한 고양이 ID를 선택
    }      
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-12 px-6">
      <h1 className="text-2xl font-apple_bigbold mb-6 text-[#3958bd]">반려묘 추가하기</h1>

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
          <input placeholder="반려묘 이름" className="w-full border p-2 rounded" value={nickname} onChange={(e) => setNickname(e.target.value)} required />
          <input type="number" placeholder="반려묘 나이" className="w-full border p-2 rounded" value={age} onChange={(e) => setAge(e.target.value)} required />
          <input placeholder="반려묘 종" className="w-full border p-2 rounded" value={species} onChange={(e) => setSpecies(e.target.value)} required />
        </div>

        <button type="submit" className="w-full bg-[#3958bd] text-white py-3.5 rounded-full font-semibold">추가하기</button>
        <button type="button" onClick={handleCancel} className="w-full bg-gray-300 text-gray-700 py-3.5 rounded-full font-semibold">취소</button>
      </form>
    </div>
  );
};

export default AddCat;