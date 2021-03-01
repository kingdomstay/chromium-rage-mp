"use strict";
mp.events.add('playerReady', function (player) {
    player.notify = function (msg, type) {
        if (msg === void 0) { msg = 'Информация'; }
        if (type === void 0) { type = 'info'; }
        player.call('C_PlayerNotify', [msg, type]);
    };
});
mp.events.addCommand('error', function (player, msg) {
    player.notify('Error message', 'error');
});
mp.events.addCommand('info', function (player, msg) {
    player.notify('Information message', 'info');
});
mp.events.addCommand('warning', function (player, msg) {
    player.notify('Warning message', 'warning');
});
mp.events.addCommand('success', function (player, msg) {
    player.notify('Success message', 'success');
});
