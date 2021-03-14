"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk = require('chalk');
mp.events.add('playerChat', function (player, msg) {
    if (!player.auth)
        return;
    if (msg.split('')[0] == '/')
        return;
    if (msg.split('')[0] == '*')
        return sendMe(player, msg.slice(1));
    if (msg.split('')[0] == '-')
        return sendDo(player, msg.slice(1));
    mp.players.broadcastInRange(new mp.Vector3(player.position.x, player.position.y, player.position.z), 5, "[" + player.id + "]" + player.name + " \u0441\u043A\u0430\u0437\u0430\u043B - " + msg);
});
function sendMe(player, msg) {
    mp.players.broadcastInRange(new mp.Vector3(player.position.x, player.position.y, player.position.z), 3, "[" + player.id + "]" + player.name + " " + msg);
}
function sendDo(player, msg) {
    mp.players.broadcastInRange(new mp.Vector3(player.position.x, player.position.y, player.position.z), 3, msg + " - [" + player.id + "]" + player.name);
}
console.log(chalk.green('[SERVICE]'), 'Basic commands loaded');
