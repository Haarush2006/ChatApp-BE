# Use the official Node.js LTS (Long Term Support) image as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for dependency installation
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install

# Copy the rest of your application code into the container
COPY . .

# If you're using TypeScript, compile it to JavaScript
# Uncomment the next line if you have a build step (e.g., `npm run build`)
# RUN npm run build

# Specify the port your WebSocket server listens on
EXPOSE 3000

# Command to start your WebSocket server
CMD [ "npm", "start" ]