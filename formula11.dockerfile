# Build the node application
FROM node:23-alpine AS builder

WORKDIR /app
COPY package*.json ./

RUN npm ci

# Sharp requires extra shit
RUN npm install --os=linux --libc=musl --cpu=x64 --include=optional sharp

COPY . .

RUN npm run build
RUN npm prune --production

# Copy the built application to a minimal image
FROM node:23-alpine

WORKDIR /app
COPY --from=builder /app/build build/
# If all deps are devDependencies, this should theoretically not be required
# COPY --from=builder /app/node_modules node_modules/
COPY package.json .

EXPOSE 5173

ENV NODE_ENV=production

CMD [ "node", "build" ]
