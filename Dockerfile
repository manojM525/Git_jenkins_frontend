
# ---- Stage 1: Build React app ----
FROM node:18 AS build

WORKDIR /app

# Copy dependency files and install
COPY package.json ./
RUN npm install

# Copy rest of the application
COPY . .

# ✅ Accept backend API URL during build
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# ✅ Build React app with backend API URL injected
RUN npm run build


# ---- Stage 2: Serve with Nginx ----
FROM nginx:alpine

# Copy production build from previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose default Nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

