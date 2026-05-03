FROM nginx:1.27-alpine

COPY frontend/ /usr/share/nginx/html/
RUN chmod -R a+rX /usr/share/nginx/html

EXPOSE 80
