FROM node:alpine
WORKDIR /app
COPY package.json .
RUN yarn
COPY . .
RUN yarn build


FROM node:alpine
WORKDIR /app
COPY package.json .
RUN yarn install --production
COPY --from=0 /app/dist ./dist


FROM mhart/alpine-node:slim
WORKDIR /app
COPY --from=1 /app .
EXPOSE 3000
CMD ["node", "./dist/main.js"]