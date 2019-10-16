class Controller {

    on() {
        this.sendMessage('clock');
    }

    off() {
        this.sendMessage('off');
    }

    toggle() {
        this.sendMessage('toggle');
    }

    sendMessage(message) {
        const dgram = require('dgram'),
            env = require('../../env'),
            socket = dgram.createSocket('udp4');

        socket.send(message, env.binaryClock.port, env.binaryClock.host, () => {
            socket.close();
        });
    }
}

module.exports = Controller;