import {
    isWorkHere,
    Job,
    JobOptions,
    startShift,
    endShift,
    editSalary,
    getSalary,
    addToSalary
} from "../index";
const chalk = require('chalk')

interface Vehicles {
    transform: {x: number, y: number, z: number},
    rotate: {x: number, y: number, z: number}
}

const vehicles: Vehicles[] = require('./buses.json')
const penalty = 0.9

const options: JobOptions = {
    uid: 'busDriver',
    name: 'Водитель автобуса',
    blip: {
        x: 436.9834289550781, y: -623.0693359375, z: 27.708667755126953,
        type: 513,
        color: 51
    },
    checkpoint: {
        x: 436.9834289550781, y: -623.0693359375, z: 27.708667755126953
    },
}

const data = {
    options: options,
    vehicles: vehicles
}

// TODO: Добавить GUI маршрутоуказателя
class BusDriver extends Job {
    constructor(props: { options: JobOptions, vehicles: Vehicles[] }) {
        super(props.options)
        this.spawnVehicles(props.vehicles)
    }

    spawnVehicles(buses: Vehicles[]) {
        let i = 0
        for (const bus of buses) {
            i = i + 1
            let numberPlate = i.toString()
            if (numberPlate.length < 2) {
                numberPlate = `0${numberPlate}`
            }
            const veh = mp.vehicles.new(mp.joaat('bus'), new mp.Vector3(bus.transform.x, bus.transform.y, bus.transform.z), {
                numberPlate: `LSBUS${numberPlate}`,
            })
            veh.setColorRGB(170, 58, 98, 255, 255, 255)
            veh.rotation = new mp.Vector3(bus.rotate.x, bus.rotate.y, bus.rotate.z)
            veh.setVariable('Job-name', options.uid)
            veh.setVariable('Job-spawnPosition', {x: bus.transform.x, y: bus.transform.y, z: bus.transform.z, xRot: bus.rotate.x, yRot: bus.rotate.y, zRot: bus.rotate.z})
        }
    }
    initWork(player: PlayerMp) {
        player.outputChatBox(`Для начала смены займите свободный автобус.`)
    }
}

const busDriver = new BusDriver(data)

mp.events.add('playerInviteJob', (player: PlayerMp, uid) => {
    if (uid != options.uid) return
    busDriver.initWork(player)
})
mp.events.add('playerEnterVehicle', (player: PlayerMp, vehicle: VehicleMp) => {
    if (!isBusJob(vehicle)) return
    if (player.seat == 0) { // Если игрок садится на место водителя
        if (isWorkHere(player, options.uid)) { // Если игрок работает здесь
            if (busRented(vehicle) != null) { // Если автобус уже арендован
                if (busRented(vehicle) == player.id) { // Если автобус арендован самим игроком
                    playerSitInBus(player)
                    player.notify('Вы можете продолжать ехать', {type: "info"})
                } else { // Если автобус арендован не этим игроком
                    player.notify('Это не ваш автобус', {type: "warning"})
                }
            } else { // Если автобус не арендован
                if (getRentedBus(player) != null) { // Если игрок уже арендует один из автобусов
                    player.removeFromVehicle()
                    player.notify('Вы уже арендуете один из автобусов')
                } else { // Успешное условие
                    rentBus(player, vehicle)
                    startShift(player)
                    playerSitInBus(player)
                }
            }
        } else { // Если игрок не работает здесь
            player.notify('У вас нет доступа к этому транспорту', {type: "error"})
            player.removeFromVehicle()
        }
    } else { // Если игрок садится как пассажир
        // TODO: Добавить систему оплаты билетов для пассажиров атвобуса
    }
})
mp.events.add('playerExitVehicle', (player: PlayerMp, vehicle: VehicleMp) => {
    if (!isBusJob(vehicle)) return
    if (player.seat == 0) {
        if (isWorkHere(player, options.uid)) {
            if (busRented(vehicle) == player.id) {
                playerLeaveBus(player)
                player.notify('У вас есть 60 секунд для того, чтобы сесть обратно в автобус', {type: "warning", duration: 7000})
            }
        }
    } else {
        // TODO: Добавить систему оплаты билетов для пассажиров атвобуса
    }
})


mp.events.add('S_Job-busDriver__completeLap', (player: PlayerMp, money: number) => {
    addToSalary(player, money)
})
mp.events.add('S_Job-busDriver__setCounter', (player: PlayerMp, state: boolean) => {
    setCounter(player, state)
})
mp.events.add('S_Job-busDriver__endShift', (player, state) => {
    busEndShift(player, state)
})

function setCounter(player: PlayerMp, state: boolean = true) {
    player.setVariable('Job-busDriver__counterActive', state)
}

function isBusJob(vehicle: VehicleMp) {
    return vehicle.getVariable('Job-name') == options.uid;
}
function busRented(vehicle: VehicleMp) {
    return vehicle.getVariable('Job-rentedBy')
}
function getRentedBus(player: PlayerMp) {
    return player.getVariable('Job-busDriver__vehicle')
}
function rentBus(player: PlayerMp, vehicle: VehicleMp) {
    vehicle.setVariable('Job-rentedBy', player.id)
    player.setVariable('Job-busDriver__vehicle', vehicle)
    player.call('C_Job-busDriver__playerRentBus', '002') // TODO: Зарандомить маршрут
    player.notify('Вы арендовали автобус', {type: "info"})
}
function unrentBus(player: PlayerMp) {
    const vehicle: VehicleMp = player.getVariable('Job-busDriver__vehicle')
    player.setVariable('Job-busDriver__vehicle', null)
    vehicle.setVariable('Job-rentedBy', null)
    const position = vehicle.getVariable('Job-spawnPosition')
    vehicle.spawn(new mp.Vector3(position.x, position.y, position.z), 1)
    vehicle.rotation = new mp.Vector3(position.xRot, position.yRot, position.zRot)
}

function playerSitInBus(player: PlayerMp) {
    player.call('C_Job-busDriver__playerSitBus')
}
function playerLeaveBus(player: PlayerMp) {
    player.call('C_Job-busDriver__playerLeaveBus')
}

function busEndShift(player: PlayerMp, failed: boolean = false) {
    const currentSalary = getSalary(player)
    if (failed) {
        if (currentSalary == 0) {
            player.notify('Вы ничего не заработали и не закончили маршрут. Вам выдано предупреждение.')
            // TODO:
        } else {
            player.notify('Вам выдан штраф в 10% от суммы выданной зарплаты')
            editSalary(player, currentSalary * penalty)
        }
        endShift(player)
    } else {
        endShift(player)
    }
    unrentBus(player)
}


console.log(chalk.green('[JOB]'), 'Bus Driver loaded')
