FROM node:10.13.0-alpine

WORKDIR /home/www
ENV NODE_ENV=development

COPY package*.json ./
RUN npm i --development

COPY . .

RUN npx babel --source-maps --out-dir ./dist/ --ignore node_modules,test.js,spec.js,coverage,dist,.nyc_output,services/web .

ENV NODE_ENV=production
RUN npm prune

CMD ["node", "./dist/services/cron/index.js"]
