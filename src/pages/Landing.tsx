import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import catImage from '../img/cat_landing.png'; 

const Landing = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadingInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next >= 100) clearInterval(loadingInterval);
        return next;
      });
    }, 40); // 4초 동안 로딩
  
    const timer = setTimeout(() => {
      navigate('/home');
    }, 4000); // 4초 뒤 이동
  
    return () => {
      clearInterval(loadingInterval);
      clearTimeout(timer);
    };
  }, [navigate]);
  

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-blue-100 text-center relative overflow-hidden">
      <img
        src={catImage}
        alt="달리는 고양이"
        className="w-48 h-48 animate-bounce"
      />
      <h1 className="text-2xl font-semibold text-[#3958bd] mb-2">🐾 혼냥일기</h1>
      <p className="text-gray-700 text-base mb-6">고양이의 하루를 기록 중...</p>

      <div className="w-64 h-3 bg-white rounded-full shadow-inner overflow-hidden">
        <div
          className="h-full bg-[#3958bd] transition-all duration-200"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <p className="mt-4 text-sm text-gray-500">Loading... {progress}%</p>
    </div>
  );
};

export default Landing;


