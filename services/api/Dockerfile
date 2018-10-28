FROM node:8.12.0-alpine

WORKDIR /home/www
ENV NODE_ENV=development

COPY package*.json ./
RUN npm i

COPY . .

RUN npx babel ./ -d ./dist --ignore node_modules,services/web,*.test.js

ENV NODE_ENV=production
RUN npm prune

CMD ["node", "./dist/services/api/app.js", "2>&1"]
