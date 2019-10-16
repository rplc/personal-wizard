function main() {
    const request = require('request'),
        env = require('../../env');

    request.post(env.kodi + '/jsonrpc', {
        json: {
            jsonrpc: '2.0',
            method:'Addons.ExecuteAddon',
            params: {
                addonid: 'script.trakt',
                params: {
                    action: 'sync',
                    silent: 'True'
                }
                // cannot use wait: true here, will not work with trakt
            },
            id: 'trakt'
        }
    });
}

main();