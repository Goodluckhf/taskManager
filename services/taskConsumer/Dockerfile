FROM node:8.7.0

WORKDIR /home/www
ENV NODE_ENV=development \
	NODE_PATH=.

RUN npm i -g nodemon

CMD nodemon --require babel-register services/taskConsumer/index.js