"use strict";
var devVehicle = undefined;
mp.events.addCommand('v', function (player, name) {
    if (name === void 0) { name = 'oppressor2'; }
    if (player.vehicle)
        return spawnVehicleError(player, 0);
    if (devVehicle)
        destroyVehicle();
    spawnVehicle(player, name);
});
mp.events.add('playerExitVehicle', function (player, veh) {
    if (veh != devVehicle)
        return;
    destroyVehicle();
});
function spawnVehicle(player, name) {
    var position = player.position;
    devVehicle = mp.vehicles.new(mp.joaat(name), new mp.Vector3(position.x, position.y, position.z));
    player.putIntoVehicle(devVehicle, 0);
}
function destroyVehicle() {
    if (devVehicle) {
        devVehicle.destroy();
    }
    devVehicle = undefined;
}
function spawnVehicleError(player, id) {
    switch (id) {
        case 0:
            player.notify('Сперва выйдите из автомобиля');
            break;
        default:
            player.notify('Ошибка');
    }
}
