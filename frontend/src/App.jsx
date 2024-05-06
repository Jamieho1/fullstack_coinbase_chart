import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HistoricalPricesPage from './pages/HistoricalPricesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/prices" element={<HistoricalPricesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
