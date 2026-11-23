import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { createContainer } from '@/di/container';
import { ServicesProvider } from '@/di/ServicesContext';
import { App } from './App';
import './styles/main.scss';

const container = createContainer();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServicesProvider value={container}>
      <HashRouter>
        <App />
      </HashRouter>
    </ServicesProvider>
  </StrictMode>,
);
