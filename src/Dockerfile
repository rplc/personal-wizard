FROM node:alpine

COPY bash/cron/periodic /etc/periodic
COPY bash/cron/rootCrontabs /etc/crontabs/root
COPY bash/entry.sh /entry.sh

WORKDIR /opt/personalWizard

ENTRYPOINT [ "/entry.sh" ]
