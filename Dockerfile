# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the application (if applicable)
# RUN yarn build

# Stage 2: Create the final image
FROM node:18-alpine

WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app .

# Install only production dependencies
RUN yarn install --production

# Expose the port the application runs on
EXPOSE 3000

# Command to run the application
CMD ["sh", "-c", "yarn start && tail -f /dev/null"]