FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.json ./
COPY src ./src
RUN npm install && npm run build

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3000/ || exit 1
CMD ["npm", "run", "start"]
