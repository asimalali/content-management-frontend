# ==============================================
# Content Management Frontend - Docker Build
# ==============================================
# Use this Dockerfile for Web Service deployment on DigitalOcean
# For Static Site deployment (FREE), this file is not needed
# ==============================================

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Build arguments for environment variables (passed at build time)
ARG VITE_API_URL
ARG VITE_BACKEND_OAUTH_URL

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_OAUTH_URL=$VITE_BACKEND_OAUTH_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# ==============================================
# Runtime stage
# ==============================================
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static files
RUN rm -rf ./*

# Copy built files from builder
COPY --from=builder /app/dist .

# Copy nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
