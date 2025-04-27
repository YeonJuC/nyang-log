import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { serverTimestamp } from 'firebase/firestore';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import imgRecord from '../img/record.png';
import imgHistory from '../img/history.png';
import imgAuto from '../img/auto.png';
import imgAlbum from '../img/album.png';
import ch_1 from '../img/ch_1.png';
import ch_2 from '../img/ch_2.png';
import ch_3 from '../img/ch_3.png';
import ch_4 from '../img/ch_4.png';
import ch_5 from '../img/ch_5.png';
import ch_6 from '../img/ch_6.png';
import { useNavigate } from 'react-router-dom';
import { useSelectedCat } from '../utils/SelectedCatContext'; 

const characterImages: Record<string, string> = {
  ch_1,
  ch_2,
  ch_3,
  ch_4,
  ch_5,
  ch_6,
};

const defaultTags = ['#행복', '#슬픔', '#분노', '#기쁨', '#불안', '#놀람', '#사랑', '#궁금','#심심'];

const Write = () => {
  const [behavior, setBehavior] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [logs] = useState<any[]>([]);
  const [profileImage] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const navigate = useNavigate();
  const { selectedCat } = useSelectedCat();

  if (!selectedCat) {
    return null;
  }
  
  const convertToCatSpeech = (text: string) => {
    const endings = ['냥~', '다냥!', '이다옹!', '했지롱~', '했다옹!', '이다냥~', '냐아~', '냐옹!'];
    const randomEnding = endings[Math.floor(Math.random() * endings.length)];
    return `${text.trim().replace(/\.$/, '')} ${randomEnding}`;
  };

  const saveLog = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("로그인 후 기록할 수 있어요!");
      return;
    }

    const cuteLog = convertToCatSpeech(behavior);
    const today = new Date();
    const todayKey = new Date().toISOString().split('T')[0];
    // 🔥 여기 수정: 날짜 + 고양이 ID를 조합해서 문서 키 생성
    const entryDoc = doc(db, 'logs', user.uid, 'entries', `${todayKey}_${selectedCat?.id}`);

    const createdDate = new Date();
    const createdDateStr = createdDate.toISOString().split('T')[0];


    // ✅ 선택한 고양이 프로필을 기본 이미지로 사용
    const newEntry = {
      text: cuteLog,
      image: imageData || (selectedCat ? characterImages[selectedCat.profileImage as keyof typeof characterImages] : ''),
      tags: selectedTags.map((tag) => tag.replace(/^#/, '')),
      createdAt: serverTimestamp(),
      createdDate: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }),
      catId: selectedCat?.id || null,  // ✅ 이 부분도 추가: 어떤 고양이 기록인지 표시!
    }; 
    

    try {
      await setDoc(entryDoc, newEntry);
      alert("기록 완료!");
      // Navigate to homepage after saving
      navigate('/history');
    } catch (e) {
      console.error(e);
      alert("저장 실패");
    }  
  };

  const resizeImage = (file: File, maxWidth = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
  
      reader.onload = (e) => {
        if (!e.target?.result) return reject('파일 읽기 실패');
        img.src = e.target.result as string;
      };
  
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas 생성 실패');

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedData = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedData);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const resized = await resizeImage(file);
      setImageData(resized);
    } catch (err) {
      console.error(err);
      alert("이미지 압축에 실패했어요!");
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  interface Feature {
    title: string;
    desc: string;
    image: string;
  }

  const features: Feature[] = [
    { title: "매일 추억 기록", desc: "냥이의 모습을 매일 저장해요.", image: imgRecord },
    { title: "지난 추억 보기", desc: "소중했던 순간을 다시 되새겨요.", image: imgHistory },
    { title: "자동 일기 확인", desc: "일기와 함께 하루를 확인해요.", image: imgAuto },
    { title: "추억 앨범 제작", desc: "냥이 추억 앨범을 만들어요.", image: imgAlbum },
  ];

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-[#f9fafb]">
      <h2 className="text-xl font-apple_bigbold text-center mb-8 text-black">혼냥일기 작성</h2>
      <p className="text-left w-full max-w-md text-gray-500 font-apple text-sm px-8 mb-1">함께하는 반려묘 기록</p>
      <p className="text-left w-full max-w-md text-black-300 font-apple_bold text-xl px-8 mb-2">오늘{selectedCat?.nickname ?? ''}의 모습을 <br/>간단히 기록해볼까요?</p>

      <div className="py-4 px-4 mb-4 flex flex-col items-center">
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg p-4 relative overflow-hidden hover:shadow-xl transition min-h-[160px]"
            >
              <h3 className="text-base font-apple_bigbold mb-1 text-[#3958bd]">{f.title}</h3>
              <p className="text-[13px] text-gray-700 font-apple pr-2">{f.desc}</p>
              <img src={f.image} alt="아이콘" className="absolute bottom-4 right-4 w-[72px] h-[72px] opacity-90" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-100 border border-gray-200 text-sm text-gray-600 rounded-xl px-4 py-3 mb-10 max-w-md w-200 font-apple">
        ✍️ 예시: <span className="text-black">소파에 올라가서 낮잠을 잤어요</span><br /> → <span className="text-[#3958bd]">소파에 올라가서 낮잠을 잤어요 냥~으로 변경이 되어 저장이 됩니다.</span><br />
        <span className="text-gray-400 block text-center text-sm ">(오늘 하루 저장하고 싶은 냥이의 순간을 기록해주세요.)</span>
      </div>
      
      {/* 이미지 선택 제목 */}
      <div className="max-w-md w-full mb-4 px-4 mx-auto">
        <h4 className="text-sm font-apple_bold text-gray-600 mb-2">이미지 선택</h4>
      </div>

      {/* 이미지 미리보기 */}
      {(imageData || characterImages[selectedCat.profileImage]) && (
        <div className="w-[260px] aspect-square mb-6 rounded-xl overflow-hidden border border-gray-200 shadow-md mx-auto">
          <img src={imageData || characterImages[selectedCat.profileImage]} alt="미리보기" className="object-cover w-full h-full" />
        </div>
      )}


      {/* 이미지 선택 안내 */}
      <label className="text-xs text-gray-400 mb-2 font-apple block text-center">(이미지를 첨부하려면 아래 버튼을 눌러주세요.)</label>
      <label className="mb-10 cursor-pointer bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-2xl shadow hover:bg-gray-100 transition font-apple_bold text-sm block w-fit mx-auto">
        파일 선택하기
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </label>

      {/* 감정 해시태그 */}
      <div className="max-w-md w-full mb-10 mx-auto px-4">
        <h4 className="text-base font-apple_bold text-gray-700 mb-4">감정 해시태그 선택</h4>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-4 gap-y-4 justify-items-center px-4 sm:px-6 md:px-8">
          {defaultTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-apple border transition-all duration-150 whitespace-nowrap
                ${selectedTags.includes(tag)
                  ? 'bg-[#3958bd] text-white border-[#3958bd]'
                  : 'bg-white text-gray-600 border-gray-300'}
              `}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 내용 입력 */}
      <div className="max-w-md w-full mb-10 mx-auto px-4">
        <h4 className="text-sm font-apple_bold text-gray-600 mb-3">내용 입력</h4>
        <textarea
          value={behavior}
          onChange={(e) => setBehavior(e.target.value)}
          placeholder="기록하고 싶은 냥이의 모습을 짧게 적어주세요!"
          className="w-full p-3 h-24 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3958bd] font-apple text-sm"
          style={{ caretColor: '#3958bd' }}
        />
      </div>

      <div className="bg-[#f9fafb] px-4 pb-10 mb-[20px]"> {/* ← 여백도 함께 주기 */}
        <button
          onClick={saveLog}
          className="text-white w-[360px] px-6 py-3 rounded-full shadow-md transition mb-10 mt-4 font-apple_bold hover:bg-[#2e4ca4]"
          style={{ backgroundColor: '#3958bd' }}
        >
          저장하기
        </button>
      </div>

      {logs.length > 0 && (
        <div className="w-full max-w-md space-y-4">
          {logs.map((log, idx) => (
            <div key={idx} className="bg-white shadow p-4 rounded-xl">
              {log.image && (
                <div className="w-full h-48 overflow-hidden rounded-md mb-2">
                  <img src={log.image} alt="저장된 이미지" className="object-cover w-full h-full" />
                </div>
              )}
              <p className="text-gray-800 font-gowun whitespace-pre-line">{log.text}</p>
              {log.tags && (
                <div className="mt-2 flex flex-wrap gap-1 text-xs text-[#3958bd] font-apple">
                  {log.tags.map((tag: string, i: number) => <span key={i}>#{tag.replace('#','')}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Write;


