import { createContext, useContext, useState, ReactNode } from 'react';
import { auth, db } from '../firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

// ✅ CatInfo 타입
export interface CatInfo {
  id: string;
  nickname: string;
  age?: string;
  species?: string;
  profileImage: string;
}

// ✅ Profile 타입
interface CatProfile {
  nickname: string;
  age: string;
  species: string;
  profileImage: string;
}

// ✅ Context 타입 정의
interface SelectedCatContextType {
  selectedCat: CatInfo | null;
  setSelectedCat: React.Dispatch<React.SetStateAction<CatInfo | null>>;
  profile: CatProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<CatProfile | null>>;
  refreshProfileAndCats: (keepSelectedId?: string) => Promise<void>;
  cats: CatInfo[]; // ✅ cats 추가
  setCats: React.Dispatch<React.SetStateAction<CatInfo[]>>; // ✅ setCats 추가
  selectedCatId: string | null; // ✅ selectedCatId 추가
  setSelectedCatId: React.Dispatch<React.SetStateAction<string | null>>; // ✅ setSelectedCatId 추가
}

// ✅ context 생성
const SelectedCatContext = createContext<SelectedCatContextType>({
  selectedCat: null,
  setSelectedCat: () => {},
  profile: null,
  setProfile: () => {},
  refreshProfileAndCats: async () => {},
  cats: [],
  setCats: () => {},
  selectedCatId: null,
  setSelectedCatId: () => {},
});

// ✅ Provider 컴포넌트
export const SelectedCatProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCat, setSelectedCat] = useState<CatInfo | null>(null);
  const [profile, setProfile] = useState<CatProfile | null>(null);
  const [cats, setCats] = useState<CatInfo[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  const refreshProfileAndCats = async (keepSelectedId?: string) => {
    const user = auth.currentUser;
    if (!user) return;
  
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return;
    const profileData = userDoc.data();
  
    setProfile({
      nickname: profileData?.nickname || '',
      age: profileData?.age || '',
      species: profileData?.species || '',
      profileImage: profileData?.profileImage || 'ch_1',
    });
  
    const catsSnap = await getDocs(collection(db, 'users', user.uid, 'cats'));
    const catList = catsSnap.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<CatInfo, 'id'>),
    }));
  
    setCats(catList);
  
    const targetId = keepSelectedId || 'profile';
  
    if (targetId === 'profile') {
      // 프로필 이름이 비어있으면, 가장 최근 고양이 선택
      if (!profileData?.nickname && catList.length > 0) {
        const latestCat = catList[catList.length - 1];
        setSelectedCat(latestCat);
        setSelectedCatId(latestCat.id);
      } else {
        setSelectedCat({
          id: 'profile',
          nickname: profileData?.nickname || '',
          age: profileData?.age || '',
          species: profileData?.species || '',
          profileImage: profileData?.profileImage || 'ch_1',
        });
        setSelectedCatId('profile');
      }
    } else {
      const found = catList.find(c => c.id === targetId);
      if (found) {
        setSelectedCat(found);
        setSelectedCatId(found.id);
      } else {
        if (catList.length > 0) {
          const latestCat = catList[catList.length - 1];
          setSelectedCat(latestCat);
          setSelectedCatId(latestCat.id);
        } else {
          setSelectedCat({
            id: 'profile',
            nickname: profileData?.nickname || '',
            age: profileData?.age || '',
            species: profileData?.species || '',
            profileImage: profileData?.profileImage || 'ch_1',
          });
          setSelectedCatId('profile');
        }
      }
    }
  };  

  return (
    <SelectedCatContext.Provider value={{
      selectedCat,
      setSelectedCat,
      profile,
      setProfile,
      refreshProfileAndCats,
      cats,
      setCats,
      selectedCatId,
      setSelectedCatId,
    }}>
      {children}
    </SelectedCatContext.Provider>
  );
};

// ✅ Context 사용 훅
export const useSelectedCat = () => useContext(SelectedCatContext);
