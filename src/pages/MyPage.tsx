import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import ch_1 from '../img/ch_1.png';
import ch_2 from '../img/ch_2.png';
import ch_3 from '../img/ch_3.png';
import ch_4 from '../img/ch_4.png';
import ch_5 from '../img/ch_5.png';
import ch_6 from '../img/ch_6.png';
import { Pencil } from 'lucide-react'; // 아이콘 사용

const characterImages: Record<string, string> = {
  ch_1, ch_2, ch_3, ch_4, ch_5, ch_6,
};

const MyPage = () => {
  const [catName, setCatName] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [species, setSpecies] = useState('');
  const [selectedImg, setSelectedImg] = useState('ch_1');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCatName(data.catName || '');
        setNickname(data.nickname || '');
        setAge(data.age || '');
        setSpecies(data.species || '');
        setSelectedImg(data.profileImage || 'ch_1');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return alert('로그인이 필요합니다.');
  
    const profile = { catName, nickname, age, species, profileImage: selectedImg };
  
    try {
      await setDoc(doc(db, 'users', user.uid), profile);
  
      // ✅ 저장 완료 후 맨 위로 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });
  
      setEditMode(false);
    } catch (e) {
      console.error('저장 오류:', e);
    }
  };  

  const selectedImgSrc = characterImages[selectedImg];

  return (
    <div className="min-h-screen bg-white">
      <h2 className="text-xl font-apple_bigbold text-center mb-8 mt-8 text-black">프로필 설정</h2>

      <div className="flex flex-col items-center mb-12">
        <img
          src={selectedImgSrc}
          alt="프로필"
          className="w-36 h-36 rounded-full mb-2"
        />
        <div className="flex items-center gap-1 text-base font-apple_bigbold">
          {nickname}
          {editMode && <Pencil className="w-4 h-4 cursor-pointer text-gray-500" />}
        </div>
      </div>

      {editMode && (
        <div className="grid grid-cols-3 gap-4 place-items-center mb-8 px-6 sm:px-8 md:px-12">
        {Object.entries(characterImages).map(([key, src]) => (
          <img
            key={key}
            src={src}
            alt={key}
            onClick={() => setSelectedImg(key)}
            className={`w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 rounded-full cursor-pointer border-4 transition-all duration-200 ${
              selectedImg === key ? 'border-[#3958bd]' : 'border-transparent'
            }`}
          />
        ))}
      </div>            
      )}
      <div className="w-full h-[5px] bg-gray-100" />
      <div className="bg-white rounded-xl p-5 w-full max-w-md mx-auto mb-[30px]">
        <h2 className="text-lg text-black font-apple_bold mb-[40px] mt-6">기본정보</h2>

        {editMode ? (
          <div className="space-y-3">
            <span className="text-gray-400 text-sm">보호자 이름</span>
            <input
              className="w-full border px-4 py-2 !mb-[15px] rounded text-sm"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="보호자 이름"
            />
            <span className="text-gray-400 text-sm">반려묘 이름</span>
            <input
              className="w-full border px-4 py-2 !mb-[15px] rounded text-sm"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="반려묘 이름"
            />
            <span className="text-gray-400 text-sm">반려묘 나이</span>
            <input
              className="w-full border px-4 py-2 !mb-[15px] rounded text-sm"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="반려묘 나이"
              type="number"
            />
            <span className="text-gray-400 text-sm">반려묘 종</span>
            <input
              className="w-full border px-4 py-2 !mb-[15px] rounded text-sm"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="반려묘 종"
            />
            <button
              onClick={handleSave}
              className="w-full !mt-[30px] bg-[#3958bd] text-white py-4 rounded-full text-sm font-semibold !mb-[70px]"
            >
              저장하기
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-700 space-y-8">
            <div className="flex justify-between">
              <span className="text-gray-400">보호자 이름</span>
              <span className="font-semibold">{catName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">반려묘 이름</span>
              <span className="font-semibold">{nickname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">반려묘 나이</span>
              <span className="font-semibold">{age}살</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">반려묘 종</span>
              <span className="font-semibold">{species}</span>
            </div>

            <button
              onClick={() => setEditMode(true)}
              className="w-full !mt-[50px] h-[50px] bg-[#3958bd] text-white py-2 rounded-full text-sm font-semibold"
            >
              수정하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;



