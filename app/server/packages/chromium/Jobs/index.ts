export interface JobOptions {
    uid: string,
    name: string,
    description?: string,
    blip: {
        x: number,
        y: number,
        z: number,
        scale?: number,
        color?: number,
        type: number
    },
    checkpoint: {
        x: number,
        y: number,
        z: number
    }
}

export class Job {
    private uid: string;
    private name: string;
    private description: string | undefined;
    private blip: BlipMp;
    private colshape: ColshapeMp;
    private marker: MarkerMp;
    constructor(props: JobOptions) {
        this.uid = props.uid
        this.name = props.name
        this.description = props.description
        this.blip = mp.blips.new(props.blip.type, new mp.Vector3(props.blip.x, props.blip.y, props.blip.z), {
            color: props.blip.color,
            shortRange: true,
            dimension: 0
        })
        this.colshape = mp.colshapes.newTube(props.checkpoint.x, props.checkpoint.y, props.checkpoint.z, 2, 0.9, 0)
        this.marker = mp.markers.new(1, new mp.Vector3(props.checkpoint.x, props.checkpoint.y, props.checkpoint.z), 1, {
            dimension: 0
        })

        this.listenEvents()
    }

    listenEvents() {
        mp.events.add('playerEnterColshape', (player, colshape: ColshapeMp) => {
            if (!player.auth) return
            if (colshape != this.colshape) return
            if (player.vehicle) return

            if (isWork(player)) {
                if (isWorkHere(player, this.uid)) {
                    if (isShift(player)) {
                        return player.notify('Сначала закончите смену', {type: "error"})
                    } else {
                        return uninviteJob(player)
                    }
                } else {
                    return player.notify('Вы уже работаете кем-то', {type: "warning"})
                }
            } else {
                inviteJob(player, this.uid)
            }
        })
    }
}


export function inviteJob(player: PlayerMp, uid: string) {
    player.setVariable('Job-name', uid)
    player.call('playerInviteJob', uid)
    mp.events.call('playerInviteJob', player, uid)
    player.notify('Вы устроились на работу', {type: "success"})
}
export function uninviteJob(player: PlayerMp) {
    const uid = getJobPlayerUid(player)
    player.call('playerUninviteJob', uid)
    mp.events.call('playerUninviteJob', player, uid)
    player.setVariable('Job-name', null)
    player.notify('Вы уволились с работы', {type: "success"})
}

export function getJobPlayerUid(player: PlayerMp) {
    return player.getVariable('Job-name')
}


export function startShift(player: PlayerMp) {
    const uid = getJobPlayerUid(player)
    player.setVariable('Job-shift', true)
    player.notify('Вы начали смену')
    player.call('playerStartShift', [uid])
    mp.events.call('playerStartShift', [player, uid])
}
export function endShift(player: PlayerMp) {
    const uid = getJobPlayerUid(player)
    player.setVariable('Job-shift', null)
    sendSalary(player)
    player.notify('Вы завершили смену')
    player.call('playerEndShift', [uid])
    mp.events.call('playerEndShift', [player, uid])
}
export function isShift(player: PlayerMp): boolean {
    return !!player.getVariable('Job-shift')
}


export function isWork(player: PlayerMp): boolean {
    return !!player.getVariable('Job-name');
}
export function isWorkHere(player: PlayerMp, uid: string): boolean {
    return player.getVariable('Job-name') == uid;
}


export function getSalary(player: PlayerMp): number {
    const salary = player.getVariable('Job-salary')
    if (salary == null) return 0
    return salary
}
export function resetSalary(player: PlayerMp) {
    player.setVariable('Job-salary', null)
}
export function addToSalary(player: PlayerMp, money: number) {
    const currentSalary = getSalary(player)
    player.setVariable('Job-salary', currentSalary + money)
}
export function editSalary(player: PlayerMp, money: number) {
    player.setVariable('Job-salary', money)
}
export function sendSalary(player: PlayerMp) {
    const salary = getSalary(player)
    if (salary == 0) {
        player.notify('Вы ничего не заработали', {type: "info"})
        return
    }
    player.notify(`Вы заработали ${salary}$`)
    resetSalary(player)
    // TODO:
}
