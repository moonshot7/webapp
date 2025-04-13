FROM node:20-slim

RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev && \

    npm cache clean --force

COPY . .

RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 3000

CMD ["node", "index.js"]
