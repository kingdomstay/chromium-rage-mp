export {}
const chalk = require('chalk')

mp.events.add('playerChat', (player, msg) => {
    if (!player.auth) return
    if (msg.split('')[0] == '/') return
    if (msg.split('')[0] == '*') return sendMe(player, msg.slice(1))
    if (msg.split('')[0] == '-') return sendDo(player, msg.slice(1))

    mp.players.broadcastInRange(new mp.Vector3(player.position.x, player.position.y, player.position.z), 5, `[${player.id}]${player.name} сказал - ${msg}`)
})

function sendMe(player: PlayerMp, msg: string) {
    mp.players.broadcastInRange(new mp.Vector3(player.position.x, player.position.y, player.position.z), 3, `[${player.id}]${player.name} ${msg}`)
}
function sendDo(player: PlayerMp, msg: string) {
    mp.players.broadcastInRange(new mp.Vector3(player.position.x, player.position.y, player.position.z), 3, `${msg} - [${player.id}]${player.name}`)
}

console.log(chalk.green('[SERVICE]'), 'Basic commands loaded')
