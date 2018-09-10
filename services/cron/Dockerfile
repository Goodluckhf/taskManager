FROM node:8.7.0

WORKDIR /home/www
ENV NODE_ENV=development

COPY . .

RUN npm i --development
RUN npx babel ./ -d ./dist --ignore node_modules,services/web

ENV NODE_ENV=production
RUN npm prune

CMD ["node", "./dist/services/api/app.js"]
