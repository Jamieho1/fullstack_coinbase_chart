import React, { useState, useEffect } from 'react';
import { getTradingPairs, getProductCandles } from '../api/CoinbaseAPI';
import Chart from 'chart.js/auto';

const HistoricalPricesPage = () => {
  const [tradingPairs, setTradingPairs] = useState([]);
  const [selectedPair, setSelectedPair] = useState('');
  const [chart, setChart] = useState(null);

  useEffect(() => {
    const fetchTradingPairs = async () => {
      const pairs = await getTradingPairs();
      setTradingPairs(pairs);
      setSelectedPair(pairs[0].id); // Automatically select the first pair
    };
    fetchTradingPairs();
  }, []);

  useEffect(() => {
    const fetchAndDisplayCandles = async () => {
      if (!selectedPair) return;
      const data = await getProductCandles(selectedPair, '2022-01-01', new Date().toISOString(), 86400);
      if (chart) chart.destroy();
      const ctx = document.getElementById('myChart');
      const newChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(d => new Date(d[0] * 1000).toLocaleDateString()),
          datasets: [{
            label: 'Price',
            data: data.map(d => d[4]) // Closing price
          }]
        }
      });
      setChart(newChart);
    };
    fetchAndDisplayCandles();
  }, [selectedPair]);

  return (
    <div>
      <select onChange={e => setSelectedPair(e.target.value)} value={selectedPair}>
        {tradingPairs.map(pair => (
          <option key={pair.id} value={pair.id}>{pair.display_name}</option>
        ))}
      </select>
      <canvas id="myChart"></canvas>
    </div>
  );
};

export default HistoricalPricesPage;
