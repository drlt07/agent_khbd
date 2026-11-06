import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import BatLoi from './thanh-phan/BatLoi';

createRoot(document.getElementById('root')!).render(<StrictMode><BatLoi><App /></BatLoi></StrictMode>);
