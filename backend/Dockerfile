FROM python:3.9-slim

# Set a directory for the app
WORKDIR /usr/src/app

# Copy the requirements file and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Make port 5001 available to the world outside this container
EXPOSE 5001

# Command to run the application
CMD ["python", "app.py"]
