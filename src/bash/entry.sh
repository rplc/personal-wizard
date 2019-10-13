#!/bin/sh

service cron start
# public server needs to be a service; needs to be started and stopped when the certs are renewed
service persWizPublic start

cd /opt/personalWizard
npm start