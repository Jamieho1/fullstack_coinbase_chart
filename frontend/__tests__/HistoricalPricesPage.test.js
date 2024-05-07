import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HistoricalPricesPage from '../src/pages/HistoricalPricesPage';
import axios from 'axios';

// Mock axios to handle HTTP requests
jest.mock('axios');

describe('HistoricalPricesPage', () => {
  test('renders component correctly', () => {
    render(<HistoricalPricesPage />);
    expect(screen.getByText('Check Historical Prices')).toBeInTheDocument();
  });

  test('fetches trading pairs successfully', async () => {
    // Mock the axios.get response
    axios.get.mockResolvedValue({
      data: [
        { id: 'BTC-USD', display_name: 'BTC/USD' },
        { id: 'ETH-USD', display_name: 'ETH/USD' }
      ]
    });

    render(<HistoricalPricesPage />);
    await waitFor(() => expect(screen.getByText('BTC/USD')).toBeInTheDocument());
    expect(screen.getByText('ETH/USD')).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    // Mock a failed axios.get call
    axios.get.mockRejectedValue(new Error('API Error'));

    render(<HistoricalPricesPage />);
    await waitFor(() => expect(screen.getByText('Failed to fetch trading pairs')).toBeInTheDocument());
  });

  test('allows date and granularity selection', () => {
    render(<HistoricalPricesPage />);
    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2022-01-01' } });
    fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2022-01-02' } });
    fireEvent.change(screen.getByLabelText('Granularity'), { target: { value: 3600 } });

    expect(screen.getByDisplayValue('2022-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2022-01-02')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3600')).toBeInTheDocument();
  });
});
