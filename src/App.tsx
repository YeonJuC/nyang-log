import { SelectedCatProvider } from './utils/SelectedCatContext';
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
import ScrollToTop from './components/ScrollToTop';
import AddCat from './pages/AddCat';
import Diary from './pages/Diary';

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

      setNeedsProfile(!docSnap.exists());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || visited === null) return null;

  return (
    <>
    <SelectedCatProvider>
        <ScrollToTop />
    
        {!user ? (
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        ) : needsProfile ? (
          <Routes>
            <Route path="*" element={<SetupProfile uid={user.uid} onComplete={() => setNeedsProfile(false)} />} />
          </Routes>
        ) : location.pathname === '/' ? (
          <Navigate to="/landing" replace />
        ) : (
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/home" element={<AppLayout><Home /></AppLayout>} />
            <Route path="/write" element={<AppLayout><Write /></AppLayout>} />
            <Route path="/history" element={<AppLayout><History /></AppLayout>} />
            <Route path="/mypage" element={<AppLayout><MyPage /></AppLayout>} />
            <Route path="/add-cat" element={<AppLayout><AddCat /></AppLayout>} />
            <Route path="/diary" element={<AppLayout><Diary /></AppLayout>} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        )}
    </SelectedCatProvider>
      
    </>
  );
}


export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

