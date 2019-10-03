FROM node:alpine

COPY package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/personalWizard && cp -a /tmp/node_modules /opt/personalWizard/

WORKDIR /opt/personalWizard
COPY . /opt/personalWizard

COPY bash/periodic /etc/periodic

COPY bash/entry.sh /entry.sh
RUN chmod +x /entry.sh

ENTRYPOINT [ "/entry.sh" ]
