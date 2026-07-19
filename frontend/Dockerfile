FROM registry.redhat.io/ubi9/nodejs-20-minimal:latest AS builder

USER root
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production image
FROM registry.redhat.io/ubi9/nodejs-20-minimal:latest AS runner

USER root
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN useradd -u 1001 -m nextuser && chown -R 1001:1001 /app
USER 1001

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="127.0.0.1"

CMD ["node", "server.js"]
