FROM node:8.7.0

WORKDIR /home/www
ENV NODE_ENV=production

COPY . .

RUN npm i
RUN npx babel ./ -d ./dist --ignore node_modules,services/web

CMD ["node", "./dist/services/api/app.js"]
