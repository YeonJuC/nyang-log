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
    <button onClick={handleLogin}>
      Google 로그인
    </button>
  );
};

export default Login;

