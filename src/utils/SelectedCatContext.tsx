// src/utils/SelectedCatContext.tsx

import { createContext, useContext, useState, ReactNode } from 'react';

// ✅ 고양이 정보 타입 정의 (nickname 포함!)
export interface CatInfo {
  id: string;
  name: string;
  nickname: string; // <- 추가된 부분
  profileImage: string;
}

// ✅ context 타입 정의
interface SelectedCatContextType {
  selectedCat: CatInfo | null;
  setSelectedCat: (cat: CatInfo | null) => void;
}

// ✅ context 생성
const SelectedCatContext = createContext<SelectedCatContextType | undefined>(undefined);

// ✅ provider 컴포넌트
export const SelectedCatProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCat, setSelectedCat] = useState<CatInfo | null>(null);

  return (
    <SelectedCatContext.Provider value={{ selectedCat, setSelectedCat }}>
      {children}
    </SelectedCatContext.Provider>
  );
};

// ✅ context 사용 훅
export const useSelectedCat = () => {
  const context = useContext(SelectedCatContext);
  if (!context) {
    throw new Error('useSelectedCat must be used within a SelectedCatProvider');
  }
  return context;
};
