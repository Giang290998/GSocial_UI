#build stage
FROM node:16-alpine as build-stage

WORKDIR /app

RUN git clone -b deploy/raspberry --single-branch https://github.com/Giang290998/GSocial_UI.git

WORKDIR /app/GSocial_UI

RUN npm install

ENV REACT_APP_BASE_URL=https://gsocial.site
ENV REACT_APP_BASE_URL_API=https://gsocial.site/api
ENV REACT_APP_URL_LOGIN=https://gsocial.site/login
ENV REACT_APP_LOGIN_GOOGLE_CLIENT_ID=1044709976489-n4u9i0dgqb612pclr8mq588hon0lukas.apps.googleusercontent.com
ENV REACT_APP_LOGIN_GOOGLE_CLIENT_SECRET=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
ENV REACT_APP_LOGIN_FACEBOOK_ID=841819993448695
ENV REACT_APP_GIPHY_KEY=JAcyotBba0yCjS7rFqwjh3ByMvFvYPRy
ENV REACT_APP_STIPOP_API_KEY=3c5311bfef1f1a4bf854fe013ec97fc2
ENV REACT_APP_CLOUDINARY_NAME=daziucjgv
ENV REACT_APP_CLOUDINARY_UPLOAD_PRESET=coum8cnt
ENV REACT_APP_SOCKET_URL=https://gsocial-connection-tcp-ip.onrender.com

RUN npm run build

#production stage
FROM nginx:1.17-alpine as production-stage

COPY --from=build-stage /app/build /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]


# docker-compose.yml
# version: "3.7"

# services:
#   app:
#     image: <image-front-end-react>
#     ports:
#       - "3000:80"
#     restart: unless-stopped
