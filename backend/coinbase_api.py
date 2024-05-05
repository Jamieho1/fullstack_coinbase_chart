import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

class CoinbaseAPI:
    def __init__(self, base_url="https://api-public.sandbox.exchange.coinbase.com"):
        self.base_url = base_url
        self.session = self.create_session()

    def create_session(self):
        session = requests.Session()
        retries = Retry(total=5, backoff_factor=0.1, status_forcelist=[500, 502, 503, 504])
        session.mount('https://', HTTPAdapter(max_retries=retries))
        return session

    def get_trading_pairs(self):
        url = f"{self.base_url}/products"
        response = self.session.get(url)
        response.raise_for_status()
        return response.json()

    def get_product_candles(self, product_id, start, end, granularity):
        url = f"{self.base_url}/products/{product_id}/candles"
        params = {
            'start': start,
            'end': end,
            'granularity': granularity
        }
        response = self.session.get(url, params=params)
        response.raise_for_status()
        return response.json()
