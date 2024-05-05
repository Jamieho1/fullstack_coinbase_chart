import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getTradingPairs = async () => {
  try {
    const response = await axios.get(`${API_URL}/trading_pairs`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch trading pairs:', error);
    throw error;
  }
};

export const getProductCandles = async (product_id, start, end, granularity) => {
  try {
    const response = await axios.get(`${API_URL}/product_candles`, {
      params: { product_id, start, end, granularity }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch product candles:', error);
    throw error;
  }
};
