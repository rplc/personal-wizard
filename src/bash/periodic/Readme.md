# Cron jobs

- files will be copied to /etc/periodic

## Cron job markup

- **Alpine Linux**: `#!/bin/sh`
- no .sh at the end of the filename
- needs to be executable on the host

## Configured cron jobs/tabs

```
# min   hour    day     month   weekday command
*/15    *       *       *       *       run-parts /etc/periodic/15min
0       *       *       *       *       run-parts /etc/periodic/hourly
0       2       *       *       *       run-parts /etc/periodic/daily
0       3       *       *       6       run-parts /etc/periodic/weekly
0       5       1       *       *       run-parts /etc/periodic/monthly
```