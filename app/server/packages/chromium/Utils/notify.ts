mp.events.add('playerReady', (player: PlayerMp) => {
  player.notify = (msg = 'Информация', type = 'info') => {
      player.call('C_PlayerNotify', [msg, type])
  }
})

mp.events.addCommand('error', (player, msg) => {
  player.notify('Error message', 'error')
})
mp.events.addCommand('info', (player, msg) => {
  player.notify('Information message', 'info')
})
mp.events.addCommand('warning', (player, msg) => {
  player.notify('Warning message', 'warning')
})
mp.events.addCommand('success', (player, msg) => {
  player.notify('Success message', 'success')
})
