FROM node:18.16.0

RUN mkdir -p /usr/app/loans-generator

WORKDIR /usr/app/loans-generator

COPY package*.json ./
RUN npm install

COPY . .

ENTRYPOINT ["npm", "run", "start"]
