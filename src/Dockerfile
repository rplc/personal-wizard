FROM node:stretch-slim

RUN apt-get update && apt-get install -y cron certbot

COPY bash/cron/periodic /etc/periodic
COPY bash/cron/crontabRoot /etc/crontabRoot
RUN crontab /etc/crontabRoot

COPY bash/entry.sh /entry.sh

COPY bash/services /etc/init.d

COPY certs /etc/letsencrypt/live/myocto.duckdns.org

WORKDIR /opt/personalWizard

ENTRYPOINT [ "/entry.sh" ]
