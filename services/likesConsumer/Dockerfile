FROM cheerlesscloud/node:8.7.0

WORKDIR /home/www
ENV NODE_ENV=development \
	NODE_PATH=.

USER 1001

RUN npm i  puppeteer
CMD ["node", "--require", "babel-register", "./services/likesConsumer/index.js"]
