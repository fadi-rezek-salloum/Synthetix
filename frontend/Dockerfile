# 1. Use the official Node image
FROM node:20-alpine

WORKDIR /app

# 2. Only copy package files first (better for caching)
COPY package*.json ./
RUN npm install

# 3. Copy the rest of the code
COPY . .

# 4. Open the dev port
EXPOSE 3000

# 5. Start Next.js in development mode
CMD ["npm", "run", "dev"]
