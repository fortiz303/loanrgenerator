FROM mcr.microsoft.com/playwright:v1.35.0-jammy

RUN mkdir -p /usr/app/loans-generator
RUN mkdir -p /usr/app/loans-generator



WORKDIR /usr/app/loans-generator

COPY package*.json ./
RUN npm install

COPY . .

ENTRYPOINT ["npm", "run", "start"]
