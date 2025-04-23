import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppLayout from './components/AppLayout';

import Home from './pages/Home';
import Write from './pages/Write';
import History from './pages/History';
import MyPage from './pages/MyPage';
import Login from './pages/Login';
import SetupProfile from './pages/SetupProfile';
import Landing from './pages/Landing';
import './App.css'; 
function AppRoutes() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [visited, setVisited] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (hasVisited) {
      setVisited(true);
    } else {
      localStorage.setItem('hasVisited', 'true');
      setVisited(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setNeedsProfile(true);
      } else {
        setNeedsProfile(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || visited === null) return null;

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  if (needsProfile) {
    return (
      <Routes>
        <Route path="*" element={<SetupProfile onComplete={() => setNeedsProfile(false)} uid={user.uid} />} />
      </Routes>
    );
  }

  // 첫 진입 시 랜딩 페이지로 리디렉션
  if (location.pathname === '/') {
    return <Navigate to="/landing" replace />;
  }

  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route path="/home" element={<AppLayout><Home /></AppLayout>} />
      <Route path="/write" element={<AppLayout><Write /></AppLayout>} />
      <Route path="/history" element={<AppLayout><History /></AppLayout>} />
      <Route path="/mypage" element={<AppLayout><MyPage /></AppLayout>} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
  
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

