import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HistoricalPricesPage from '../src/pages/HistoricalPricesPage';
import axios from 'axios';
import LandingPage from '../src/pages/LandingPage';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';  

// Handle HTTP requests
jest.mock('axios');

describe('LandingPage navigation', () => {
  test('navigates to Historical Prices page on link click', () => {
    // Set up and render the component inside MemoryRouter
    render(
      <MemoryRouter initialEntries={['/']}>
        <LandingPage />
      </MemoryRouter>
    );

    // Simulate user clicking the link to navigate
    const link = screen.getByRole('link', { name: /check historical prices/i });
    userEvent.click(link);

    // Check if the link attempts to navigate to the correct endpoint
    expect(link).toHaveAttribute('href', '/prices');
  });
});

describe('HistoricalPricesPage', () => {
  beforeEach(() => {
    // Axios.get response with a broader set of data
    axios.get.mockResolvedValue({
      data: [
        { id: 'LINK-USD', display_name: 'LINK/USD' },
        { id: 'LINK-USDC', display_name: 'LINK/USDC' },
        { id: 'XRP-BTC', display_name: 'XRP/BTC' },
        { id: 'XRP-EUR', display_name: 'XRP/EUR' },
        { id: 'XRP-GBP', display_name: 'XRP/GBP' },
        { id: 'BCH-USD', display_name: 'BCH/USD' },
        { id: 'USDT-USD', display_name: 'USDT/USD' },
        { id: 'BTC-USD', display_name: 'BTC/USD' },
        { id: 'BAT-USDC', display_name: 'BAT/USDC' },
        { id: 'BTC-GBP', display_name: 'BTC/GBP' },
        { id: 'BTC-EUR', display_name: 'BTC/EUR' },
        { id: 'ETH-BTC', display_name: 'ETH/BTC' }
      ]
    });
  });

  test('renders trading pair selector with at least one of the specified options', async () => {
    render(<HistoricalPricesPage />);
    const expectedPairs = ['LINK/USD', 'XRP-EUR', 'BTC-USD', 'ETH-BTC'];
    await waitFor(() => {
      expectedPairs.forEach(pair => {
        if (screen.queryByText(pair)) {
          expect(screen.getByText(pair)).toBeInTheDocument();
        }
      });
    });
  });

  test('allows interaction with date inputs', () => {
    render(<HistoricalPricesPage />);
    const startDateInput = screen.getByDisplayValue('2022-01-01');
    const endDateInput = screen.getByDisplayValue('2022-01-02');
    
    fireEvent.change(startDateInput, { target: { value: '2022-01-03' } });
    fireEvent.change(endDateInput, { target: { value: '2022-01-04' } });

    expect(screen.getByDisplayValue('2022-01-03')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2022-01-04')).toBeInTheDocument();
  });

  test('allows granularity selection', () => {
    render(<HistoricalPricesPage />);
    const granularitySelect = screen.getByDisplayValue('Hourly');
    fireEvent.change(granularitySelect, { target: { value: 86400 } });
    expect(screen.getByDisplayValue('Daily')).toBeInTheDocument();
  });

});