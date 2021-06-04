FROM node:16
RUN apt-get update && apt-get install -y net-tools python build-essential valgrind
WORKDIR /mediaserver
COPY . .
RUN yarn install --production && yarn build
EXPOSE 10000-59999/udp
EXPOSE 5000
ENV ADDRESS=0.0.0.0
CMD ["node", "dist/index.js"]