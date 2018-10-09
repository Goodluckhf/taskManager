FROM node:8.7.0 as node

COPY ./services/web/package*.json ./
RUN npm i

COPY ./services/web .
RUN npm run build

FROM nginx:1.13.12-alpine

WORKDIR /home/www

COPY ./services/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./services/web .
COPY --from=node ./build ./public

