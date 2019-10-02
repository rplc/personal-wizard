FROM node:alpine

COPY package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/personalWizard && cp -a /tmp/node_modules /opt/personalWizard/

WORKDIR /opt/personalWizard
COPY . /opt/personalWizard

COPY bash/tvshow_scraper_email.sh /etc/periodic/monthly/tvshow_scraper_email
RUN chmod +x /etc/periodic/monthly/tvshow_scraper_email

COPY bash/entry.sh /entry.sh
RUN chmod +x /entry.sh

ENTRYPOINT [ "/entry.sh" ]
