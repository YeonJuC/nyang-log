import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('로그인 성공:', result.user);
      navigate('/');
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  return (
    <div className="flex flex-col items-center">
          <button
            onClick={handleLogin}
            className="my-8 px-6 py-3 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-all"
            style={{ backgroundColor: '#3958bd' }}
          >
            🚀 Google 로그인하기
          </button>
    </div> 
  );
};

export default Login;

