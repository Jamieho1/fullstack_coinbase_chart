import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div>
      <h1>Welcome to the Historical Prices Viewer</h1>
      <Link to="/prices">Check Historical Prices</Link>
    </div>
  );
};

export default LandingPage;
