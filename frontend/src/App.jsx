import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage'; 
import HistoricalPricesPage from './pages/HistoricalPricesPage'; 

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/prices" element={<HistoricalPricesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
