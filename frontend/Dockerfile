# Build stage
FROM node:20-alpine as build

# Accept API URL as build argument
ARG VITE_API_BASE_URL=http://localhost:8000/api

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Set environment variable for Vite build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
