FROM node:alpine

COPY bash/periodic /etc/periodic
COPY bash/entry.sh /entry.sh

WORKDIR /opt/personalWizard
COPY . /opt/personalWizard

ENTRYPOINT [ "/entry.sh" ]
