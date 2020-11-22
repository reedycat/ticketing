# Specify a base image
FROM node:12.18.4-alpine3.12

# Specify working dir
WORKDIR /app

# Include project files
COPY package.json ./
# Specify dependencies (this executes only if packages changes)
RUN npm install --only=prod
# Include project files
COPY ./ ./

# Specify default command
CMD [ "npm", "start" ]
