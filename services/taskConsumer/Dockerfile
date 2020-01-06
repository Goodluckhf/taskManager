FROM cheerlesscloud/node:10.13.0

WORKDIR /home/www
ENV NODE_ENV=development
RUN apt-get update && apt-get install -y mc
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init


COPY package*.json ./
RUN npm i

COPY . .

ENV NODE_ENV=production
RUN npm i puppeteer@2.0.0 && npm i puppeteer-extra@3.1.7 && npm i puppeteer-extra-plugin-stealth@2.4.5
RUN npx tsc --skipLibCheck -p ./services/taskConsumer/tsconfig.build.json
RUN npm prune

USER 1001
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "./dist/services/taskConsumer/index.js"]
