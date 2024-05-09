# fullstack_coinbase_chart

## Getting started 
1.	Clone the repository:
git clone https://github.com/Jamieho1/fullstack_coinbase_chart
2.	Docker-compose up build
The application should be running the frontend at http://localhost:3000
and backend at http://localhost:5001/api/trading_pairs and http://localhost:5001/api/product_candles 
3.	[Alternative method]
Run ‘python app.py’ for the backend
And ‘npm start’ for the frontend

Performing  unit test of the backend:
1. Pip install pytest
2. Navigate to the backend by ‘cd backend’ 
3. Run the tests with pytest: ‘pytest test_app.py’ 
Performing test on the frontend:
1. Navigate to the frontend by ‘cd frontend’ 
2. Run the test with ‘npm test'
