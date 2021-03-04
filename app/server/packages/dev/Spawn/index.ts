let devVehicle: VehicleMp | undefined = undefined

mp.events.addCommand('v', (player, name= 'oppressor2') => {
    if (player.vehicle) return spawnVehicleError(player,0);
    if (devVehicle) destroyVehicle()
    spawnVehicle(player, name)
})
mp.events.add('playerExitVehicle', (player, veh) => {
    if (veh != devVehicle) return;
    destroyVehicle()
})

function spawnVehicle(player: PlayerMp, name: string) {
    const position = player.position
    devVehicle = mp.vehicles.new(mp.joaat(name), new mp.Vector3(position.x, position.y, position.z))
    player.putIntoVehicle(devVehicle, 0)
}
function destroyVehicle() {
    if (devVehicle) {
        devVehicle.destroy()
    }
    devVehicle = undefined
}
function spawnVehicleError(player: PlayerMp, id: number) {
    switch (id) {
        case 0:
            player.notify('Сперва выйдите из автомобиля')
            break
        default:
            player.notify('Ошибка')
    }
}
