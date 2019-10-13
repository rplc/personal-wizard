# Personal Wizard/Assistent

## mongo
`mongod --dbpath=./mongo`

## [web-push](https://www.npmjs.com/package/web-push) API
- https required for registration
  - how to https on duckDNS (see [https Readme](./httpsReadme.md))
- Caution: Browser must be running to receive the push notification
  - only exception: Chrome on Android (will receive the notifications even if closed)

## Media Watcher
- Kodi JSON RCP
- gets all tv shows
- queries [themoviedb.org](https://developers.themoviedb.org/3/tv/get-tv-details) for number of season
- email/push notification if seasons are missing (realy needed or just in the HP?)
- mongo db
  - stores blacklist
  - stores kodi DB ID: theMobieDB ID
    - some are already set in the imdbnumber of kodi (but not all are korrekt...)

## Traffic Alerts
- daily(?) roadworks alert
- alerts around commute times for congestions
- **not going to happen** Google Maps/Routes API costs, no free alternative, mdm-portal of germany is useless

## Weather Alerts
- datasources:
  - some free weather api (e.g. [darksky.net](https://darksky.net/dev/docs))
  - binary clock/digoo weather stations
- push alerts if it rains/thunders around the time to walk the dog
- sends push notification around 18 o'clock if
  - it will be above 25°C the next day (need to go jogging in the morning)
  - it will be below -5°C in the night (need to cover the car windows)

## Homepage
- put tv show in the media watcher black list
- binary clock control
  - get-state, set-state
  - current weather data
  - schedule on/off time of binary clock?

## [Cron Jobs](https://www.npmjs.com/package/cron)
- for the media watcher, traffic/weather alerts(?)
- certificate renewal

## Binary Clock control
- save schedules and activate one (holiday, work, ...)