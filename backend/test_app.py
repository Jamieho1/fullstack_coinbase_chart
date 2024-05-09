import pytest
from flask import json
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_trading_pairs(client):
    """Test the /api/trading_pairs endpoint."""
    response = client.get('/api/trading_pairs')
    assert response.status_code == 200
    assert isinstance(json.loads(response.data), list)

def test_product_candles_missing_parameters(client):
    """Test the /api/product_candles endpoint with missing parameters."""
    response = client.get('/api/product_candles')
    assert response.status_code == 400
    assert 'Missing one or more required parameters' in response.get_json()['error']

def test_product_candles_success(client):
    """Test the /api/product_candles endpoint with all required parameters."""
    response = client.get('/api/product_candles', query_string={
        'product_id': 'BTC-USD',
        'start': '2022-01-01T00:00:00Z',
        'end': '2022-01-02T00:00:00Z',
        'granularity': '3600'
    })
    assert response.status_code == 200
    assert isinstance(json.loads(response.data), list)
