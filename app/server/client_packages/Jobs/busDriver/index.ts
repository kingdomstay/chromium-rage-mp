const id = 'busDriver'
const player = mp.players.local
const routes = [
    {
        "routeRendered": "002",
        "routeName": "Автовокзал - LS:PD",
        "priceForLap": 100,
        "checkpoints": [
            {
                "x": 422.5958251953125, "y": -672.1461181640625, "z": 28.143779754638672
            },
            {
                "x": 395.32855224609375, "y": -674.6719970703125, "z": 28.238317489624023
            },
            {
                "x": 354.034423828125, "y": -675.085693359375, "z": 28.343271255493164
            },
            {
                "x": 328.78936767578125, "y": -721.1348266601562, "z": 28.350990295410156
            },
            {
                "busStop": true,
                "busStopName": "Больница",
                "x": 307.1871337890625, "y": -767.94482421875, "z": 28.262968063354492
            },
            {
                "x": 293.18145751953125, "y": -828.0422973632812, "z": 28.339462280273438
            },
            {
                "x": 257.5227355957031, "y": -926.0761108398438, "z": 28.18166732788086
            },
            {
                "x": 239.29299926757812, "y": -992.2432250976562, "z": 28.316314697265625
            },
            {
                "x": 261.7550354003906, "y": -1060.1800537109375, "z": 28.21356773376465
            },
            {
                "busStop": true,
                "busStopName": "LS:PD",
                "x": 361.0541076660156, "y": -1064.5787353515625, "z": 28.36545181274414
            },
            {
                "x": 400.7608947753906, "y": -1027.9031982421875, "z": 28.438711166381836
            },
            {
                "x": 418.9996337890625, "y": -957.6007080078125, "z": 28.361419677734375
            },
            {
                "x": 503.73907470703125, "y": -944.917236328125, "z": 25.978120803833008
            },
            {
                "x": 508.74725341796875, "y": -730.0105590820312, "z": 23.824462890625
            },
            {
                "x": 460.8331604003906, "y": -668.4051513671875, "z": 26.558242797851562
            },
            {
                "busStop": true,
                "busStopName": "Автовокзал",
                "x": 460.7581787109375, "y": -611.52685546875, "z": 27.499752044677734
            }
        ]
    }
]

const busStopTime = 5000
const time = 60
let currentTime = time
let counter: NodeJS.Timeout

let job: any = {
    active: null,
    route: null,
    currentCheckpoint: null,
    checkpoint: {
        marker: null,
        colshape: null,
        blip: null
    }
}

function loadRoute(uid: string) {
    job.route = getRoute(uid)
    job.currentCheckpoint = 0
    job.active = true

    startRoute()
}
function startRoute() {
    setAvailableLeaveBus(true)
    generateCheckpoint()
}
function resetRoute() {
    if (job.active) {
        if (job.checkpoint.marker) {
            job.checkpoint.marker.destroy()
        }
        if (job.checkpoint.colshape) {
            job.checkpoint.colshape.destroy()
        }
        if (job.checkpoint.blip) {
            job.checkpoint.blip.destroy()
        }
        job.active = null
        job.route = null
        job.currentCheckpoint = null
        job.checkpoint.marker = null
        job.checkpoint.colshape = null
        job.checkpoint.blip = null
    }
}

function getRoute(uid: string) {
    for (const route of routes) {
        if (route.routeRendered == uid) {
            return route
        }
    }
    return routes[0]
}

function generateCheckpoint() {
    const props = job.route
    const i = job.currentCheckpoint

    if (props.checkpoints[i].busStop) {
        job.checkpoint = {
            marker: mp.markers.new(21, new mp.Vector3(props.checkpoints[i].x, props.checkpoints[i].y, props.checkpoints[i].z  + 2), 3, {
                dimension: 0,
                color: [255, 0, 0, 100]
            }),
            colshape: mp.colshapes.newTube(props.checkpoints[i].x, props.checkpoints[i].y, props.checkpoints[i].z, 3.5, 4, 0),
            blip: mp.blips.new(1, new mp.Vector3(props.checkpoints[i].x, props.checkpoints[i].y, props.checkpoints[i].z), {
                dimension: 0,
                shortRange: false,
                color: 1
            })
        }
    } else {
        job.checkpoint = {
            marker: mp.markers.new(1, new mp.Vector3(props.checkpoints[i].x, props.checkpoints[i].y, props.checkpoints[i].z), 4, {
                dimension: 0,
                color: [255, 255, 255, 128]
            }),
            colshape: mp.colshapes.newTube(props.checkpoints[i].x, props.checkpoints[i].y, props.checkpoints[i].z, 4, 4, 0),
            blip: mp.blips.new(1, new mp.Vector3(props.checkpoints[i].x, props.checkpoints[i].y, props.checkpoints[i].z), {
                dimension: 0,
                shortRange: false,
                color: 4,
                scale: 0.5
            })
        }
    }
}
function reachCheckpoint() {
    const i = job.currentCheckpoint

    job.checkpoint.marker.destroy()
    job.checkpoint.colshape.destroy()
    job.checkpoint.blip.destroy()
    job.checkpoint.marker = null
    job.checkpoint.colshape = null
    job.checkpoint.blip = null
    if (i == 0) {
        setAvailableLeaveBus(false)
    }
    if (i == job.route.checkpoints.length - 1) {
        completeLap()
    } else {
        job.currentCheckpoint = job.currentCheckpoint + 1
    }

    if (job.route.checkpoints[i].busStop) {
        mp.gui.notifications.show('Посадка..', {
            type: "warning",
            duration: busStopTime - 250
        })
        setTimeout(() => {
            if (!job.active) return
            generateCheckpoint()
            return
        }, busStopTime)
    } else {
        generateCheckpoint()
    }
}

function completeLap() {
    mp.gui.chat.push('Вы завершили маршрут. Продолжайте движение или завершите смену, выйдя из автобуса')
    job.currentCheckpoint = 0
    setAvailableLeaveBus(true)
    mp.events.callRemote('S_Job-busDriver__completeLap', job.route.priceForLap)
}

function setAvailableLeaveBus(state: boolean = false) {
    job.playerCanLeaveBus = state
}

mp.events.add('playerEnterColshape', (colshape) => {
    if (colshape != job.checkpoint.colshape) return
    if (player.vehicle) {
        if (player.vehicle == player.getVariable('Job-busDriver__vehicle')) {
            reachCheckpoint()
        }
    }
})


mp.events.add('C_Job-busDriver__playerRentBus', (route) => {
    loadRoute(route)
})
mp.events.add('C_Job-busDriver__playerSitBus', () => {
    if (wasStartedCounter()) resetCounter()
})
mp.events.add('C_Job-busDriver__playerLeaveBus', () => {
    startCounter()
})


function wasStartedCounter() {
    return !!player.getVariable('Job-busDriver__counterActive');
}

function startCounter() {
    mp.events.callRemote('S_Job-busDriver__setCounter', true)
    counter = setInterval(() => {
        if (currentTime == 0) {
            completeCounter()
        }
        currentTime = currentTime - 1
    }, 1000)
}
function resetCounter(fix: boolean = false) {
    mp.events.callRemote('S_Job-busDriver__setCounter', false)
    clearInterval(counter)
    currentTime = time
    if (fix) currentTime = time + 1 // Фикс бага, когда таймер уже должен был завершиться, но он выполняется ещё раз, когда арендованный автобус уже зареспавнился
}
function completeCounter() {
    if (job.playerCanLeaveBus) {
        mp.events.callRemote('S_Job-busDriver__endShift', false)
    } else {
        mp.events.callRemote('S_Job-busDriver__endShift', true)
    }
    resetCounter(true)
    resetRoute()
}
