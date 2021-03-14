export {};

const chalk = require('chalk')
const db = require('../Utils/db')
const log = require('../Utils/log')
const bcrypt = require('bcryptjs')


interface LoginData {
    login: string,
    password: string
}
interface RegisterData {
    username: string,
    email: string,
    password: string,
    repeatPassword: string,
    regIp: string,
    socialClub: string
}

/** Preauth */
mp.events.add('S_AuthWindowReady', playerReady)

function playerReady(player: PlayerMp) {
    player.alpha = 0
    player.dimension = player.id + 1000
    player.position = new mp.Vector3(-1402.4600830078125, -152.7124786376953, 47.661441802978516)
    getPossibleAccount(player).then(r => {
        if (r) {
            player.call('C_Auth-redirectTo', ['login', r])
        } else {
            player.call('C_Auth-redirectTo', ['register'])
        }
    })
}

/** Finish auth */
mp.events.add('playerAuth', playerAuth)
function playerAuth(player: PlayerMp) { // TODO: Не забыть переделать
    player.alpha = 255
    player.dimension = 0
    player.position = new mp.Vector3(-1402.4600830078125, -152.7124786376953, 47.661441802978516)
}

/** Login */
mp.events.add('S_Auth-SendLoginCredentials', (player, data) => {
    data = JSON.parse(data)
    tryLoginUser(player, data)
})
async function tryLoginUser(player: PlayerMp, data: LoginData) {
    try {
        let conn = await db.getConnection()
        let profiles = await conn.query("SELECT id, password_hash FROM users WHERE username=? OR email=?", [data.login, data.login])
        if (profiles.length == 0) return player.call('C_Auth-Handler', ["LOGIN_BAD"])
        if (!bcrypt.compareSync(data.password, profiles[0].password_hash)) return player.call('C_Auth-Handler', ["LOGIN_BAD"])
        // TODO: Система банов

        loginUser(player, profiles[0], conn)
    }
    catch (e) {
        log.error(e)
        return player.call('C_Auth-Handler')
    }
}
async function loginUser(player: PlayerMp, profile: any, conn: any) {
    try {
        let characters = await conn.query("SELECT id, first_name, last_name FROM characters WHERE profile_id=?", [profile.id])
        player.profileId = profile.id
        player.call('C_Auth-Handler', ["LOGIN_SUCCESS"])
        if (characters.length == 0) {
            player.call('C_Auth-redirectTo', ["select-character"])
        } else {
            player.call('C_Auth-redirectTo', ["select-character", JSON.stringify(characters)])
        }
    } catch (e) {
        log.error(e)
        return player.call('C_Auth-Handler')
    } finally {
        conn.end()
    }
}


/** Register */
mp.events.add('S_Auth-SendRegisterCredentials', (player, data) => {
    data = JSON.parse(data)
    data.regIp = player.ip
    data.socialClub = player.rgscId

    tryRegisterUser(player, data)
})
async function tryRegisterUser(player: PlayerMp, data: RegisterData) {
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    const regexLogin =   /^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*$/
    const regexPassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/
    let conn

    if (!(data.username && data.email && data.password && data.repeatPassword)) return
    if (!(data.username.match(regexLogin))) return
    if (!(data.email.match(regexEmail))) return
    if (!(data.password.match(regexPassword))) return
    if (data.password != data.repeatPassword) return

    try {
        conn = await db.getConnection()

        let profiles = await conn.query("SELECT id  FROM users WHERE email=?", [data.email])
        if (profiles.length > 0) return player.call('C_Auth-Handler', ["EMAIL_BUSY"])

        profiles = await conn.query("SELECT id FROM users WHERE username=?", [data.username])
        if (profiles.length > 0) {
            return player.call('C_Auth-Handler', ["USERNAME_BUSY"])
        }

        profiles = await conn.query("SELECT id FROM users WHERE social_club=?", [data.socialClub])
        if (profiles.length > 0) {
            return player.call('C_Auth-Handler', ["SС_ALREADY_CONNECTED"])
        }

        registerUser(player, data)
    } catch (e) {
        log.error(e)
        return player.call('C_Auth-Handler')
    } finally {
        if (conn) conn.end();
    }
}
async function registerUser(player: PlayerMp, data: RegisterData) {
    const salt = bcrypt.genSaltSync(10)
    const passwordHash = bcrypt.hashSync(data.password, salt);
    let conn
    try {
        conn = await db.getConnection()
        await conn.query('INSERT INTO users (username, password_hash, email, social_club, reg_ip) VALUES (?, ?, ?, ?, INET_ATON(?))', [data.username, passwordHash, data.email, data.socialClub, data.regIp])
        player.call('C_Auth-Handler', ["REGISTER_SUCCESS"])
        player.call('C_Auth-redirectTo', ["login", data.username])
    } catch (e) {
        log.error(e)
        return player.call('C_Auth-Handler')
    } finally {
        if (conn) conn.end();
    }
}

/** Select character */
mp.events.add('S_Auth-SendSelectedCharacter', trySelectCharacter)
async function trySelectCharacter(player: PlayerMp, id: number) {
    const profileId = player.profileId
    let conn
    try {
        conn = await db.getConnection()
        let character = await conn.query("SELECT * FROM characters WHERE id=? AND profile_id=?", [id, profileId])
        if (character.length != 1) return player.call('C_Auth-Handler', ["SELECTED_CHARACTER_NOT_YOU"])

        selectCharacter(player, character[0])
    } catch (e) {
        log.error(e)
        return player.call('C_Auth-Handler')
    } finally {
        if (conn) conn.end();
    }
}
async function selectCharacter(player: PlayerMp, character: any) {
    player.characterId = character.id
    player.firstName = character.first_name
    player.lastName = character.last_name
    player.name = `${player.firstName} ${player.lastName}`
    player.auth = true
    player.call('C_Auth-Handler', ["SELECTED_CHARACTER_SUCCESS"])

    /******************************************************************/
    player.call('playerAuth') // Установить в другое место после добавления функционала
    mp.events.call('playerAuth', (player)) // Установить в другое место после добавления функционала

    try {
        const spawnPosition = await getLastPosition(player.characterId)
        if (spawnPosition) {
            player.spawn(new mp.Vector3(spawnPosition.x, spawnPosition.y, spawnPosition.z))
            player.dimension = spawnPosition.dimension
        } else {
            player.spawn(new mp.Vector3(-1658.22509765625, 236.318115234375, 62.390960693359375))
            player.dimension = 0
        }
    } catch (e) {
        log.error(e)
    }
    /* Удалить данный участок кода при добавлении редактора персонажа */
}

/** Create character */
// TODO: Создать редактор персонажа

/** Методы */
async function getPossibleAccount(player: PlayerMp) {
    let conn
    try {
        conn = await db.getConnection()
        let profiles = await conn.query("SELECT id, username FROM users WHERE social_club=?", [player.rgscId])
        if (profiles[0]) {
            return profiles[0].username
        } else {
            return null
        }
    } catch (e) {
        log.error(e)
        return player.call('C_Auth-Handler')
    } finally {
        if (conn) conn.end();
    }
}
async function getLastPosition(characterId: number) {
    console.log(characterId)
    let conn
    try {
        conn = await db.getConnection()
        let character = await conn.query("SELECT last_position FROM characters WHERE id=?", [characterId])
        if (character.length != 0) {
            return JSON.parse(character[0].last_position)
        } else {
            return 0
        }
    } catch (e) {
        log.error(e)
    } finally {
        conn.end()
    }
}
async function setLastPosition(player: PlayerMp) {
    let conn

    const position = ({
        x: player.position.x,
        y: player.position.y,
        z: player.position.z,
        xRot: 0,
        yRot: 0,
        zRot: 0,
        dimension: player.dimension
    })
    try {
        conn = await db.getConnection()
        let character = await conn.query("INSERT INTO characters (last_position) VALUES (?) WHERE id=?", [JSON.stringify(position), player.characterId])
    } catch (e) {
        log.error(e)
    } finally {
        conn.end()
    }
}

console.log(chalk.green('[SERVICE]'), 'Authentication loaded')
