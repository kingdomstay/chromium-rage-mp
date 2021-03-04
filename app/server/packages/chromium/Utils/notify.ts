mp.events.add('playerReady', (player: PlayerMp) => {
  player.notify = (msg = 'Информация', options= {type: "info", duration: 4000}) => {
      player.call('C_PlayerNotify', [msg, options])
  }
})
