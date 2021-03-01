"use strict";
/** Auth */
require('./Auth');
/** Jobs */
/** Utils */
require('./Utils/notify');
mp.events.add('playerAuth', function (player) {
    player.notify('test');
});
