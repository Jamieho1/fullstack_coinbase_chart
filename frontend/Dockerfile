# Using Node 16 Alpine for a lightweight image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend application source code
COPY . .

# Build the application using the build script specified in package.json
RUN npm run build

# Install serve to serve the build directory
RUN npm install -g serve

# Expose port 3000 for the serve command
EXPOSE 3000

# Command to run the app using serve on port 3000
CMD ["serve", "-s", "dist", "-l", "3000"]

