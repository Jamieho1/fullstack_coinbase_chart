from flask import Flask, jsonify, request
from coinbase_api import CoinbaseAPI

app = Flask(__name__)
coinbase_api = CoinbaseAPI()

@app.route('/')
def home():
    return "Welcome to the Stock Price Visualization API!"

@app.route('/api/trading_pairs')
def trading_pairs():
    try:
        data = coinbase_api.get_trading_pairs()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/product_candles')
def product_candles():
    product_id = request.args.get('product_id')
    start = request.args.get('start')
    end = request.args.get('end')
    granularity = request.args.get('granularity')

    # Check if all parameters are present
    if not all([product_id, start, end, granularity]):
        return jsonify({'error': 'Missing one required parameters: product_id'}), 400

    try:
        data = coinbase_api.get_product_candles(product_id, start, end, granularity)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
