/** Auth */
require('./Auth')

/** Jobs */


/** Utils */
require('./Utils/notify')
mp.events.add('playerAuth', (player) => {
  player.notify('test')
})
