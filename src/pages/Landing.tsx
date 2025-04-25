import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import catImage from '../img/cat_landing.png'; 
import logoIcon from '../img/icon-192x192.png';

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
    <div className="h-screen flex flex-col justify-center items-center bg-white text-center relative overflow-hidden">
      <img src={logoIcon} alt="혼냥일기 로고" className="w-20 h-20 mb-8" />
      
      <div className="flex flex-col items-center space-y-0">
        <img
          src={catImage}
          alt="달리는 고양이"
          className="w-28 h-28 animate-bounce mb-[0px]"
        />
        <div className="w-32 h-5 bg-gray-100 rounded-full shadow-inner overflow-hidden">
          <div
            className="h-full bg-[#3958bd] transition-all duration-200"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-500">Loading... {progress}%</p>
    </div>
  );
};

export default Landing;


