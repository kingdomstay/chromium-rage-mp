const dbb = require('../Utils/db')

class MoneyCore {
    money: number
    private lock: boolean
    constructor() {
        this.money = 20
        this.lock = false
    }

    private set lockBalance(state: boolean) {
        this.lock = state
    }
    private get lockBalance(): boolean {
        return this.lock
    }

    get balance(): number {
        return this.money
    }
    update(money: number) {
        if (this.lockBalance) return
        this.snapshot(money)
    }
    add(money: number) {
        if (this.lockBalance) return
        this.snapshot(this.balance + money)
    }
    pay(money: number) {
        if (this.lockBalance) return
        this.snapshot(this.balance - money)
    }
    remove() {
        if (this.lockBalance) return
        this.snapshot(0)
    }
    async snapshot(money: number) {
        this.lockBalance = true
        try {
            const conn = dbb.getConnection()
            const rows = conn.query('SELECT ')
        } catch (e) {

        }
    }
}


mp.events.add('playerReady', (player: any) => {
    player.money = new MoneyCore()
})

mp.events.addCommand('money', (player) => {
    // @ts-ignore
    player.notify(`Ваш текущий баланс ${player.money.balance}$`)
})
