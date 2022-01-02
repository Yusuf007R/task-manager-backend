FROM node:alpine
  WORKDIR /app
  COPY package.json .
  RUN yarn
  COPY . .
  RUN yarn build


  from node:alpine
  WORKDIR /app
  COPY package.json .
  RUN yarn install --production
  COPY --from=0 /app/dist ./dist
  EXPOSE 3000
  CMD ["node", "./dist/main.js"]