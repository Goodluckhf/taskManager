FROM node:8.7.0 as node

COPY . .
RUN npm i
RUN npm run build

FROM nginx:1.13.12-alpine

WORKDIR /home/www

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY . .
COPY --from=node ./build ./public

