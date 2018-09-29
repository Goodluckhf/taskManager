FROM cheerlesscloud/node:8.7.0

WORKDIR /home/www
ENV NODE_ENV=development
USER 1001

COPY package*.json ./
RUN npm i

COPY . .

RUN npx babel ./ -d ./dist --ignore node_modules,services/web

ENV NODE_ENV=production
RUN npm prune
RUN npm i puppeteer

CMD ["node", "./dist/services/taskConsumer/index.js"]
