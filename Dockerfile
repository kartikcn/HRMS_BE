# Step 1: Use official Node.js image from Docker Hub
FROM node:18-alpine

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy the package.json and package-lock.json (if available) into the container
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install --legacy-peer-deps

# Step 5: Copy the rest of the application code into the container
COPY . .

# Step 6: Expose the port that your application will run on
EXPOSE 5203

# Step 7: Set the command to run your app
CMD ["npm", "start"]
