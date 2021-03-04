"use strict";
mp.events.addCommand('playerpos', function (player) {
    console.log(player.position);
    console.log(player.dimension);
});
mp.events.addCommand('pos', function (player, msg) {
    if (msg === void 0) { msg = 'Position'; }
    console.log("=== " + msg + " ===");
    console.log("====" + '='.repeat(msg.length) + "====");
    player.call('C_Dev-CheckpointPos');
});
mp.events.add('S_Dev-CheckpointPos', function (player, position) {
    console.log("x: " + position.x + ", y: " + position.y + ", z: " + position.z);
    player.notify('Отправлено в консоль');
});
mp.events.addCommand('vehpos', function (player, msg) {
    if (msg === void 0) { msg = 'Position'; }
    if (player.vehicle) {
        player.notify('Отправлено в консоль');
        console.log("=== " + msg + " ===");
        console.log("Position - x: " + player.vehicle.position.x + ", y: " + player.vehicle.position.y + ", z: " + player.vehicle.position.z);
        console.log("Rotations - x: " + player.vehicle.rotation.x + ", y: " + player.vehicle.rotation.y + ", z: " + player.vehicle.rotation.z);
        console.log("====" + '='.repeat(msg.length) + "====");
    }
    else {
        player.notify('Вы должны находиться в машине', {
            type: "error"
        });
    }
});
