import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import DemoApp from './demo/DemoApp';
import './styles.css';
import './hosted/hosted.css';
import './demo/practice-demo.css';
import './demo/demo.css';
createRoot(document.getElementById('root')!).render(<StrictMode><DemoApp /></StrictMode>);
