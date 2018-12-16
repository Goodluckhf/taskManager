FROM cheerlesscloud/node:10.13.0

WORKDIR /home/www
ENV NODE_ENV=development
RUN apt-get install -y mc
USER 1001

COPY package*.json ./
RUN npm i

COPY . .

RUN npx babel --source-maps --out-dir ./dist/ --ignore node_modules,test.js,spec.js,coverage,dist,.nyc_output,services/web .

ENV NODE_ENV=production
RUN npm prune
RUN npm i puppeteer

CMD ["node", "./dist/services/taskConsumer/index.js"]
