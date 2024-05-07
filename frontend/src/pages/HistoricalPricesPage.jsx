import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';
const WS_URL = 'wss://ws-feed.pro.coinbase.com';
const allowedGranularities = [60, 300, 900, 3600, 21600, 86400];

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
  const [RealTimeGranularity, setRealTimeGranularity] = useState('');

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
      if (!selectedHistoricalPair || !allowedGranularities.includes(Number(historicalGranularity))) {
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
        if (!realTimeChart) {
          const ctx = document.getElementById('realTimeChart');
          const newChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: [new Date(response.time).toLocaleTimeString()],
              datasets: [{
                label: 'Real-Time Price',
                data: [response.price],
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false
              }]
            }
          });
          setRealTimeChart(newChart);
        } else {
          realTimeChart.data.labels.push(new Date(response.time).toLocaleTimeString());
          realTimeChart.data.datasets[0].data.push(response.price);
          realTimeChart.update();
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
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <div>
        <h2>Historical Data</h2>
        <select onChange={e => setSelectedHistoricalPair(e.target.value)} value={selectedHistoricalPair}>
          {tradingPairs.map(pair => (
            <option key={pair.id} value={pair.id}>{pair.display_name}</option>
          ))}
        </select>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <select value={historicalGranularity} onChange={e => setHistoricalGranularity(e.target.value)}>
          {allowedGranularities.map(g => (
            <option key={g} value={g}>{`${g} seconds`}</option>
          ))}
        </select>
        <canvas id="historicalChart"></canvas>
      </div>
      <div>
        <h2>Real-Time Data</h2>
        <select onChange={e => setSelectedRealTimePair(e.target.value)} value={selectedRealTimePair}>
          {tradingPairs.map(pair => (
            <option key={pair.id} value={pair.id}>{pair.display_name}</option>
          ))}
        </select>
        <select value={RealTimeGranularity} onChange={e => setRealTimeGranularity(e.target.value)}>
          {allowedGranularities.map(g => (
            <option key={g} value={g}>{`${g} seconds`}</option>
          ))}
        </select>
        <canvas id="realTimeChart"></canvas>
      </div>
    </div>
  );
};

export default HistoricalPricesPage;
