FROM andresvidal/rpi3-mongodb3

COPY ./entry.sh /

ENTRYPOINT ["/entry.sh"]
# the only important change is the --journal
CMD ["mongod", "--journal"]