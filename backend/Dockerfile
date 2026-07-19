FROM registry.redhat.io/ubi9/nodejs-20-minimal:latest

USER root
RUN microdnf install -y python3 python3-pip && microdnf clean all

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY dist ./dist/

RUN mkdir -p uploads && chown -R 1001:1001 /app

USER 1001

EXPOSE 3001

CMD ["node", "dist/main"]
