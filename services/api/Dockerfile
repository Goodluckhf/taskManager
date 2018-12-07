FROM node:8.12.0-alpine

WORKDIR /home/www
ENV NODE_ENV=development
RUN apk update && apk add mc
COPY package*.json ./
RUN npm i

COPY . .

RUN npx babel --source-maps --out-dir ./dist/ --ignore node_modules,test.js,spec.js,coverage,dist,.nyc_output,services/web .

ENV NODE_ENV=production
RUN npm prune

CMD ["node", "./dist/services/api/app.js", "2>&1"]
