FROM node:18 AS build
WORKDIR /frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /frontend/dist /usr/share/nginx/html
COPY default.conf.template /etc/nginx/templates/default.conf.template
#COPY default.conf /etc/nginx/conf.d/default.conf
RUN addgroup -g 1001 -S front && \
    adduser -S front -u 1001 && \
    chown -R front:front /usr/share/nginx/html && \
    chown -R front:front /var/cache/nginx && \
    chown -R front:front /var/log/nginx && \
    chown -R front:front /etc/nginx/conf.d && \
    chown -R front:front /etc/nginx/templates && \
    touch /var/run/nginx.pid && \
    chown -R front:front /var/run/nginx.pid

USER front
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]