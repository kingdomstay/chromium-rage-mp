"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk = require('chalk');
mp.events.add('playerReady', function (player) {
    player.notify = function (msg, options) {
        if (msg === void 0) { msg = 'Информация'; }
        if (options === void 0) { options = { type: "info", duration: 4000 }; }
        player.call('C_PlayerNotify', [msg, options]);
    };
});
console.log(chalk.green('[SERVICE]'), 'Notify system loaded');
