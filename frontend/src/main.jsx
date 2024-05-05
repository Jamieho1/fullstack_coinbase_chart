import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Ensure path is correct, .jsx extension is optional
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
