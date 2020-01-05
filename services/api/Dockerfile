FROM node:10.13.0-alpine

WORKDIR /home/www
ENV NODE_ENV=development
RUN apk update && apk add mc
COPY package*.json ./
RUN npm i

COPY . .

RUN npx tsc --skipLibCheck -p ./services/api/tsconfig.build.json

ENV NODE_ENV=production
RUN npm prune

CMD ["node", "./dist/services/api/app.js", "2>&1"]
