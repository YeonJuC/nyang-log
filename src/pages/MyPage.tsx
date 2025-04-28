// src/pages/MyPage.tsx

import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useSelectedCat } from '../utils/SelectedCatContext';
import ch_1 from '../img/ch_1.png';
import ch_2 from '../img/ch_2.png';
import ch_3 from '../img/ch_3.png';
import ch_4 from '../img/ch_4.png';
import ch_5 from '../img/ch_5.png';
import ch_6 from '../img/ch_6.png';
import { Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const characterImages: Record<string, string> = { ch_1, ch_2, ch_3, ch_4, ch_5, ch_6 };

const MyPage = () => {
  const { selectedCat, setSelectedCat, profile, setProfile, refreshProfileAndCats } = useSelectedCat();
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [species, setSpecies] = useState('');
  const [profileImage, setProfileImage] = useState('ch_1');
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedCat) {
      setNickname(selectedCat.nickname || '');
      setAge(selectedCat.age || '');
      setSpecies(selectedCat.species || '');
      setProfileImage(selectedCat.profileImage || 'ch_1');
    }
  }, [selectedCat]);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user || !selectedCat) return alert('로그인이 필요합니다.');
  
    try {
      if (selectedCat.id === 'profile') {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, { nickname, age, species, profileImage });
        setProfile(prev => prev ? ({ ...prev, nickname, age, species, profileImage }) : null);
        setSelectedCat(prev => prev ? ({ ...prev, nickname, age, species, profileImage }) : null);
      } else {
        const catRef = doc(db, 'users', user.uid, 'cats', selectedCat.id);
        await updateDoc(catRef, { nickname, age, species, profileImage });
        setSelectedCat(prev => prev ? ({ ...prev, nickname, age, species, profileImage }) : null);
      }
  
      alert('수정 완료!');
      setEditMode(false);
  
      await refreshProfileAndCats(selectedCat?.id);
  
      // ✅ 저장 완료 후 마이페이지 맨 위로 스크롤 이동
      window.scrollTo({ top: 0, behavior: 'smooth' });
  
    } catch (e) {
      console.error('수정 실패:', e);
      alert('수정 중 오류가 발생했습니다.');
    }
  };  
  // 삭제 함수 추가
  const handleDelete = async () => {
    const user = auth.currentUser;
    if (!user || !selectedCat) {
      alert('로그인이 필요합니다.');
      return;
    }
  
    if (selectedCat.id === 'profile') {
      alert('기본 프로필은 삭제할 수 없습니다.');
      return;
    }
  
    const confirmDelete = window.confirm('정말 삭제하시겠습니까? 삭제하면 복구할 수 없습니다.');
    if (!confirmDelete) return;
  
    try {
      const catRef = doc(db, 'users', user.uid, 'cats', selectedCat.id);
      await deleteDoc(catRef);
  
      alert('삭제 완료!');
      setEditMode(false);
  
      await refreshProfileAndCats();
      navigate('/home'); // 삭제 후 홈 이동
    } catch (e) {
      console.error('삭제 실패:', e);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };    

  return (
    <div className="min-h-screen bg-white">
      <h2 className="text-xl font-apple_bigbold text-center my-8 text-black">프로필 설정</h2>

      <div className="flex flex-col items-center mb-12">
        <img
          src={characterImages[profileImage as keyof typeof characterImages]}
          alt="프로필"
          className="w-36 h-36 rounded-full mb-2"
        />
        <div className="flex items-center gap-1 text-base font-apple_bigbold">
          {nickname || selectedCat?.nickname}
          {editMode && <Pencil className="w-4 h-4 cursor-pointer text-gray-500" />}
        </div>
      </div>

      {editMode ? (
        <div className="grid grid-cols-3 gap-4 place-items-center mb-8 px-6 sm:px-8 md:px-12">
          {Object.entries(characterImages).map(([key, src]) => (
            <img
              key={key}
              src={src}
              alt={key}
              onClick={() => setProfileImage(key)}
              className={`w-20 h-20 rounded-full cursor-pointer border-4 transition-all duration-200 ${
                profileImage === key ? 'border-[#3958bd]' : 'border-transparent'
              }`}
            />
          ))}
        </div>
      ) : null}

      <div className="w-full h-[5px] bg-gray-100" />

      <div className="bg-white rounded-xl p-5 w-full max-w-md mx-auto mb-8">
        <h2 className="text-lg text-black font-apple_bold mb-6 mt-6">기본정보</h2>

        {editMode ? (
          <div className="space-y-3 mb-[100px]">
            <span className="text-gray-400 text-sm">반려묘 이름</span>
            <input
              className="w-full border px-4 py-2 rounded text-sm !mb-[12px]"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="반려묘 이름"
            />
            <span className="text-gray-400 text-sm">반려묘 나이</span>
            <input
              className="w-full border px-4 py-2 rounded text-sm !mb-[12px]"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="반려묘 나이"
              type="number"
            />
            <span className="text-gray-400 text-sm">반려묘 종</span>
            <input
              className="w-full border px-4 py-2 rounded text-sm"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="반려묘 종"
            />
            <button
              onClick={handleSave}
              className="w-full !mt-[40px] bg-[#3958bd] text-white py-3 rounded-full text-sm font-semibold"
            >
              저장하기
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-700 space-y-8">
            <div className="flex justify-between">
              <span className="text-gray-400">반려묘 이름</span>
              <span className="font-semibold">{nickname || selectedCat?.nickname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">반려묘 나이</span>
              <span className="font-semibold">{age || selectedCat?.age}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">반려묘 종</span>
              <span className="font-semibold">{species || selectedCat?.species}</span>
            </div>
            <button
              onClick={() => setEditMode(true)}
              className="w-full mt-8 h-[50px] bg-[#3958bd] text-white py-2 rounded-full text-sm font-semibold"
            >
              수정하기
            </button>

            {/* 삭제 버튼 추가 */}
            <button
              onClick={handleDelete}
              className="w-full mt-4 h-[50px] bg-red-500 text-white py-2 rounded-full text-sm font-semibold"
            >
              삭제하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;
function setCats(arg0: (prevCats: any) => any) {
  throw new Error('Function not implemented.');
}

