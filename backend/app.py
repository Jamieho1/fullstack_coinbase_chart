from flask import Flask, jsonify, request
from flask_cors import CORS
from coinbase_api import CoinbaseAPI

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
coinbase_api = CoinbaseAPI()

@app.route('/api/trading_pairs', methods=['GET'])
def trading_pairs():
    try:
        data = coinbase_api.get_trading_pairs()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/product_candles', methods=['GET'])
def product_candles():
    product_id = request.args.get('product_id')
    start = request.args.get('start')
    end = request.args.get('end')
    granularity = request.args.get('granularity')

    if not all([product_id, start, end, granularity]):
        return jsonify({'error': 'Missing one or more required parameters'}), 400

    try:
        data = coinbase_api.get_product_candles(product_id, start, end, granularity)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
