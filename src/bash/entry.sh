#!/bin/sh

service cron start
# public server needs to be a service; needs to be started and stopped when the certs are renewed
service persWizPublic start

# TODO only temporary, need to add the second (local) server
while true; do :; done