let notificationUrl = '';

self.addEventListener('push', event => {
    const data = event.data && JSON.parse(event.data.text()) || {};

    notificationUrl = data.url;
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.message,
            icon: data.icon,
            tag: data.tag
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();

    //TODO access event.notification.url?!
    event.waitUntil(
        clients.matchAll({
            type: 'window'
        })
        .then(() => {
            if (clients.openWindow) {
                return clients.openWindow(notificationUrl);
            }
        })
    );
});