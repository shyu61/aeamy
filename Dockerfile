FROM node:16.5.0-stretch-slim

WORKDIR /usr/src/app

COPY . .

CMD ["yarn", "start"]

# docker run --rm -it -d -p 8080:3000 aeamy
