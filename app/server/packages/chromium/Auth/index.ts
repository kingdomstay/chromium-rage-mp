const db = require('../Utils/db')
const log = require('../Utils/log')
const bcrypt = require('bcryptjs')

/** 1 этап. Запрос авторизации у игрока */
mp.events.add('playerJoin', (player: PlayerMp) => {
  // Инициализируем процедуру авторизации игрока
  playerPreAuth(player)
})
mp.events.add('S_AuthWindowLoaded', async (player: PlayerMp) => {
  if (await possibleAccounts(player)) {
    player.call('C_Auth-needAuth')
  } else {
    player.call('C_Auth-needRegister')
  }
})
function playerPreAuth(player: PlayerMp) {
  player.call('C_Auth-initAuth')
  player.alpha = 0
  player.dimension = player.id + 1500
  player.position = new mp.Vector3(-1402.4600830078125, -152.7124786376953, 47.661441802978516)
}
async function possibleAccounts(player: PlayerMp) { // TODO: В будущем дополнить проверку storage данных, а также проверку на аккаунты Steam и Epic Games
  try {
    const socialClub = player.socialClub
    const conn = await db.getConnection()
    const rows = await conn.query("SELECT id FROM users WHERE social_club=(?)", [socialClub])
    return !!rows[0];
  } catch (err) {
    log.error(err)
  }
}

/** 2 этап. Проверка авторизации или регистрация нового аккаунта */
mp.events.add('S_SendLoginCredentialsToServer', async (player, args) => {
  const data = JSON.parse(args)
  if (!(data[0] && data[1])) {
    player.call('C_Auth-handler', ['BAD_DATA'])
    return
  }

  try {
    const conn = await db.getConnection()
    const rows = await conn.query("SELECT * FROM users WHERE login=(?)", [data[0]])
    console.log(rows.length)
    if (rows.length == 0) {
      player.call('C_Auth-handler', ['LOGIN_FAIL'])
      return
    }

    const row = rows[0]
    console.log(row)
    if (!bcrypt.compareSync(data[1], row.hash_password)) {
      player.call('C_Auth-handler', ['LOGIN_FAIL'])
      return
    }

    player.call('C_Auth-handler', ['SUCCESS_LOGIN'])
    mp.events.call('playerAuth', player, row)
    player.setVariable('userId', row.id)
    player.auth = true
    player.alpha = 255
    player.dimension = row.last_position.dimension
    player.position = new mp.Vector3(row.last_position.x, row.last_position.y, row.last_position.z)
  } catch (err) {
    log.error(err)
    player.call('C_Auth-hanlder')
  }
})
mp.events.add('S_SendRegisterCredentialsToServer', async (player, args) => {
  const data = JSON.parse(args)

  const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  const regexLogin =   /^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*$/
  const regexPassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/

  if (!data[0].match(regexLogin)) {
    player.call('C_Auth-handler', ['BAD_LOGIN'])
    return
  }
  if (!data[1].match(regexEmail)) {
    player.call('C_Auth-handler', ['BAD_EMAIL'])
    return
  }
  if (data[2] != data[3]) {
    player.call('C_Auth-handler', ['NO_EQUAL_PASSWORDS'])
    return
  }
  if (!data[2].match(regexPassword)) {
    player.call('C_Auth-handler', ['BAD_PASSWORD'])
    return
  }

  const conn = await db.getConnection()
  let rows = await conn.query("SELECT id FROM users WHERE email=(?)", [data[1]])
  if (rows[0]) {
    player.call('C_Auth-handler', ['EMAIL_BUSY'])
    return
  }
  rows = await conn.query("SELECT id FROM users WHERE login=(?)", [data[0]])
  if (rows[0]) {
    player.call('C_Auth-handler', ['LOGIN_BUSY'])
    return
  }

  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(data[2], salt);

  try {
    await conn.query("INSERT INTO users (login, email, hash_password, social_club) VALUES (?, ?, ?, ?)", [data[0], data[1], hash, player.socialClub])
    player.call('C_Auth-handler', ['SUCCESS_REGISTER'])
    console.log(JSON.parse(args))
  } catch(err) {
    player.call('C_Auth-handler')
    log.error(err)
  }
})

/** Методы */
async function savePlayerLastPosition(player: any) {
  if (!player.auth) return
  const id = player.getVariable('userId')
  const lastPosition = {
    x: player.position.x,
    y: player.position.y,
    z: player.position.z,
    dimension: player.dimension
  }
  try {
    const conn = await db.getConnection()
    console.log(lastPosition)
    await conn.query("UPDATE users SET last_position=(?) WHERE id=(?)", [lastPosition, id])
  } catch(err) {
    log.error(err)
  }
}

/** События */
mp.events.add('playerQuit', savePlayerLastPosition)
