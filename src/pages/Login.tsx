// src/pages/Login.tsx
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';

const Login = () => {

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      // 로그인 후 자동으로 App.tsx에서 상태 확인됨
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fc]">
      <button
        onClick={handleGoogleLogin}
        className="px-6 py-3 bg-[#3958bd] text-white font-bold rounded-full shadow-lg"
      >
        🚀 Google 로그인하기
      </button>
    </div>
  );
};

export default Login;
