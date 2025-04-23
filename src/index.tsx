import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import * as serviceWorkerRegistration from '../src/serviceWorkerRegistration'; 

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);

// ✅ 서비스 워커 등록
serviceWorkerRegistration.register();