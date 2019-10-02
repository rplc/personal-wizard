#!/bin/sh

stop_cron_daemon() {
    local cron_pid="$1";
    if [ -n "$cron_pid" ] && kill -0 "$cron_pid" &>/dev/null; then
        kill "$cron_pid";
    else
        exit 0
    fi
}

# start the node project
cd /opt/personalWizard && npm start &

# start cron in foreground mode and using bash to put it in background
/usr/sbin/crond -f -L15 &
cron_pid=$!

trap "stop_cron_daemon $cron_pid" INT TERM EXIT

wait $cron_pid