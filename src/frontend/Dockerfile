# Step 1: Use the official Node.js image as a build environment
FROM node:latest AS build-stage

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Build the application
RUN npm run build

# Step 7: Use Nginx to serve the application
FROM nginx:alpine

# Step 8: Copy the built files from the previous stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Step 9: Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Step 10: Expose port 3030
EXPOSE 3000

# Step 11: Start Nginx server
CMD ["nginx", "-g", "daemon off;"]