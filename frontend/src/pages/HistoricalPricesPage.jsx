import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';
const WS_URL = 'wss://ws-feed.pro.coinbase.com';
const allowedGranularities = [
  { value: 60, label: "1 Minute" },
  { value: 300, label: "5 Minutes" },
  { value: 900, label: "15 Minutes" },
  { value: 3600, label: "Hourly" },
  { value: 21600, label: "6 Hours" },
  { value: 86400, label: "Daily" }
];

const HistoricalPricesPage = () => {
  const [tradingPairs, setTradingPairs] = useState([]);
  const [selectedHistoricalPair, setSelectedHistoricalPair] = useState('');
  const [selectedRealTimePair, setSelectedRealTimePair] = useState('');
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate, setEndDate] = useState('2022-01-02');
  const [historicalGranularity, setHistoricalGranularity] = useState(3600);
  const [historicalChart, setHistoricalChart] = useState(null);
  const [realTimeChart, setRealTimeChart] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [realTimeGranularity, setRealTimeGranularity] = useState(60);

  useEffect(() => {
    const fetchTradingPairs = async () => {
      try {
        const response = await axios.get(`${API_URL}/trading_pairs`);
        setTradingPairs(response.data || []);
        if (response.data.length > 0) {
          setSelectedHistoricalPair(response.data[0].id);
          setSelectedRealTimePair(response.data[0].id);
        } else {
          console.error('No trading pairs available.');
        }
      } catch (error) {
        console.error('Failed to fetch trading pairs:', error);
      }
    };
    fetchTradingPairs();
  }, []);

  useEffect(() => {
    const fetchAndDisplayCandles = async () => {
      const isGranularityValid = allowedGranularities.some(g => g.value === Number(historicalGranularity));

      if (!selectedHistoricalPair || !isGranularityValid) {
        setErrorMessage('Invalid granularity or no selected trading pair.');
        return;
      }
      const startTimestamp = new Date(startDate).getTime();
      const endTimestamp = new Date(endDate).getTime();
      const expectedPoints = (endTimestamp - startTimestamp) / (historicalGranularity * 1000);

      if (expectedPoints > 300) {
        setErrorMessage('Too many data points requested.');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/product_candles`, {
          params: {
            product_id: selectedHistoricalPair,
            start: startDate,
            end: endDate,
            granularity: historicalGranularity
          }
        });
        if (historicalChart) {
          historicalChart.destroy();
        }
        const ctx = document.getElementById('historicalChart');
        const newChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: response.data.map(d => new Date(d[0] * 1000).toLocaleDateString()).reverse(),
            datasets: [{
              label: 'Price',
              data: response.data.map(d => d[4]).reverse(),
              borderColor: 'rgba(75, 192, 192, 1)',
              fill: false
            }]
          }
        });
        setHistoricalChart(newChart);
      } catch (error) {
        console.error('Failed to fetch product candles:', error);
        setErrorMessage('Failed to fetch data.');
      }
    };

    fetchAndDisplayCandles();
  }, [selectedHistoricalPair, startDate, endDate, historicalGranularity]);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        channels: [{ name: 'ticker', product_ids: [selectedRealTimePair] }]
      }));
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      if (response.type === 'ticker' && response.product_id === selectedRealTimePair) {
        const newTime = new Date(response.time).toLocaleTimeString();
        const newPrice = response.price;

        if (realTimeChart) {
          realTimeChart.data.labels.push(newTime);
          realTimeChart.data.datasets.forEach((dataset) => {
            dataset.data.push(newPrice);
          });
          realTimeChart.update();
        } else {
          const ctx = document.getElementById('realTimeChart');
          const newChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: [newTime],
              datasets: [{
                label: 'Real-Time Price',
                data: [newPrice],
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false
              }]
            }
          });
          setRealTimeChart(newChart);
        }
      }
    };

    return () => {
      if (ws.readyState === 1) {
        ws.close();
      }
      if (realTimeChart) {
        realTimeChart.destroy();
        setRealTimeChart(null);
      }
    };
  }, [selectedRealTimePair]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div>
        <h2>Historical Data</h2>
        <select data-testid="historical-trading-pair" onChange={e => setSelectedHistoricalPair(e.target.value)} value={selectedHistoricalPair}>
          {tradingPairs.map(pair => (
            <option key={pair.id} value={pair.id}>{pair.display_name}</option>
          ))}
        </select>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <select value={historicalGranularity} onChange={e => setHistoricalGranularity(e.target.value)}>
          {allowedGranularities.map(g => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        <canvas id="historicalChart"></canvas>
        {/* {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} */}
      </div>
      <div>
        <h2>Real-Time Data</h2>
        <select data-testid="realtime-trading-pair" onChange={e => setSelectedRealTimePair(e.target.value)} value={selectedRealTimePair}>
          {tradingPairs.map(pair => (
            <option key={pair.id} value={pair.id}>{pair.display_name}</option>
          ))}
        </select>
        <select value={realTimeGranularity} onChange={e => setRealTimeGranularity(e.target.value)}>
          {allowedGranularities.map(g => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        <canvas id="realTimeChart"></canvas>
      </div>
    </div>
  );
};

export default HistoricalPricesPage;
