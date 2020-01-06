FROM node:10.13.0-alpine

WORKDIR /home/www
ENV NODE_ENV=development

COPY package*.json ./
RUN npm i --development

COPY . .

RUN npx tsc --skipLibCheck -p ./services/cron/tsconfig.build.json

ENV NODE_ENV=production
RUN npm prune

CMD ["node", "./dist/services/cron/index.js"]
