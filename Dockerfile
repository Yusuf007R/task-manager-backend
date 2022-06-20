FROM arm64v8/node:16
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
RUN yarn build


FROM arm64v8/node:16
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install --production
COPY --from=0 /app/dist ./dist


FROM arm64v8/node:16-alpine
WORKDIR /app
COPY --from=1 /app .
EXPOSE 3000
CMD ["node", "./dist/main.js"]