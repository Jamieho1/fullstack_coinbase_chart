import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';
const allowedGranularities = [60, 300, 900, 3600, 21600, 86400]; // Allowed granularities in seconds

const HistoricalPricesPage = () => {
  const [tradingPairs, setTradingPairs] = useState([]);
  const [selectedPair, setSelectedPair] = useState('');
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate, setEndDate] = useState('2022-01-02');
  const [granularity, setGranularity] = useState(3600);
  const [chart, setChart] = useState(null);
  const [errorMessage, setErrorMessage] = useState(''); // State to hold error messages

  useEffect(() => {
    const fetchTradingPairs = async () => {
      try {
        const response = await axios.get(`${API_URL}/trading_pairs`);
        const pairs = response.data;
        if (pairs.length > 0 && pairs[0].id) {
          setTradingPairs(pairs);
          setSelectedPair(pairs[0].id);
        } else {
          console.error('No trading pairs available or missing ID.');
        }
      } catch (error) {
        console.error('Failed to fetch trading pairs:', error);
      }
    };
    fetchTradingPairs();
  }, []);

  useEffect(() => {
    const fetchAndDisplayCandles = async () => {
      setErrorMessage(''); // Clear previous error messages
      if (!selectedPair || !allowedGranularities.includes(Number(granularity))) {
        setErrorMessage('Invalid granularity or no selected trading pair.');
        return;
      }
      const startTimestamp = new Date(startDate).getTime();
      const endTimestamp = new Date(endDate).getTime();
      const expectedPoints = (endTimestamp - startTimestamp) / (granularity * 1000);

      if (expectedPoints > 300) {
        setErrorMessage('Too many data points requested. Adjust your date range or granularity.');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/product_candles`, {
          params: {
            product_id: selectedPair,
            start: startDate,
            end: endDate,
            granularity
          }
        });
        const data = response.data;
        if (chart) chart.destroy();
        const ctx = document.getElementById('myChart');
        const newChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.map(d => new Date(d[0] * 1000).toLocaleDateString()).reverse(),
            datasets: [{
              label: 'Price',
              data: data.map(d => d[4]).reverse(),
              borderColor: 'rgba(75, 192, 192, 1)',
              fill: false
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: false
              }
            }
          }
        });
        setChart(newChart);
      } catch (error) {
        console.error('Failed to fetch product candles:', error);
        setErrorMessage('Failed to fetch data due to a server error. Please try again.');
      }
    };
    
    fetchAndDisplayCandles();
  }, [selectedPair, startDate, endDate, granularity]);

  return (
    <div>
      <div>
        <select onChange={e => setSelectedPair(e.target.value)} value={selectedPair}>
          {tradingPairs.map(pair => (
            <option key={pair.id} value={pair.id}>{pair.display_name}</option>
          ))}
        </select>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <select value={granularity} onChange={e => setGranularity(e.target.value)}>
          {allowedGranularities.map(g => (
            <option key={g} value={g}>{`${g} seconds`}</option>
          ))}
        </select>
      </div>
      <canvas id="myChart"></canvas>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} 
    </div>
  );
};

export default HistoricalPricesPage;
