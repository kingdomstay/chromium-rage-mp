const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
const regexLogin =   /^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*$/
const regexPassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/

let authBrowser = mp.browsers.new('package://Browsers/Auth/auth.html')
let authCamera = mp.cameras.new('default', new mp.Vector3(-1393.0072021484375, -157.15443420410156, 55.08986282348633), new mp.Vector3(0,0,0), 40);

/** Server Zone */
mp.events.add('C_Auth-initAuth', () => {
  preAuth()
})

mp.events.add('C_Auth-needAuth', () => {
  setTimeout(() => {
    authBrowser.execute('redirectToSlide("login")')
  }, 2000)
})
mp.events.add('C_Auth-needRegister',() => {
  setTimeout(() => {
    authBrowser.execute('redirectToSlide("register")')
  }, 2000)
})

mp.events.add('C_AuthWindowLoaded', () => {
  mp.events.callRemote('S_AuthWindowLoaded')
})

mp.events.add('C_Auth-handler', (key) => {
  switch (key) {
    case 'SUCCESS_LOGIN':
      mp.gui.notifications.show('Вы вошли в аккаунт', {
        type: "success"
      })
      authorizated()
      break
    case 'SUCCESS_REGISTER':
      mp.gui.notifications.show('Вы успешно зарегистрировались', {
        type: "success"
      })
      authBrowser.execute('playerRegistered()')
      break
    default:
      errorHandler(key)
      break
  }
})

/** CEF Zone */
mp.events.add('C_SendLoginCredentialsToClient', (args) => {
  // TODO: Добавить обработчик ошибок при пользовательском вводе
  mp.events.callRemote('S_SendLoginCredentialsToServer', args)
})
mp.events.add('C_SendRegisterCredentialsToClient', tryRegister)

/** Methods Zone */
function preAuth() {
  authCamera.pointAtCoord(-1542.977294921875, -77.08079528808594, 64.43563079833984);
  authCamera.setActive(true);
  mp.game.cam.renderScriptCams(true, false, 0, true, false);

  setTimeout(async () => {
    mp.gui.cursor.visible = true;
  }, 0);
  mp.gui.cursor.show(true, true)
  mp.gui.chat.show(false)

  mp.game.ui.displayHud(false)
  mp.game.ui.displayRadar(false)
}

function authorizated() {
  mp.game.cam.renderScriptCams(false, false, 0, true, false);
  authCamera.destroy()
  authBrowser.destroy()

  setTimeout(async () => {
    mp.gui.cursor.visible = false;
  }, 0);
  mp.gui.cursor.show(false, false)
  mp.gui.chat.show(true)

  mp.game.ui.displayHud(true)
  mp.game.ui.displayRadar(true)
}

function tryRegister(args: any): void {
  const data = JSON.parse(args)

  if (!(data[0] && data[1] && data[2] && data[3])) {
    errorHandler('BAD_DATA')
    return
  }
  if (!data[0].match(regexLogin)) {
    errorHandler('BAD_LOGIN')
    return
  }
  if (!data[1].match(regexEmail)) {
    errorHandler('BAD_EMAIL')
    return
  }
  if (data[2] != data[3]) {
    errorHandler('NO_EQUAL_PASSWORDS')
    return
  }
  if (!data[2].match(regexPassword)) {
    errorHandler('BAD_PASSWORD')
    return
  }

  mp.events.callRemote('S_SendRegisterCredentialsToServer', args)
}
function tryLogin(args: any): void {
  const data = JSON.parse(args)
  if (!(data[0] && data[1])) {
    errorHandler('BAD_DATA')
    return
  }

  mp.events.callRemote('S_SendLoginCredentialsToServer', args)
}

function errorHandler(key: string) {
  switch (key) {
    case 'NO_EQUAL_PASSWORDS':
      mp.gui.notifications.show('Пароли не совпадают', {
        type: "error"
      })
      authBrowser.execute('loading(false)')
      break
    case 'BAD_PASSWORD':
      mp.gui.notifications.show('Пароль небезопасен, введите другой пароль', {
        type: "error"
      })
      authBrowser.execute('loading(false)')
      break
    case 'WRONG_PASSWORD':
      mp.gui.notifications.show('Неверный пароль', {
        type: "error"
      })
      authBrowser.execute('loading(false)')
      break
    case 'BAD_LOGIN':
      mp.gui.notifications.show('Логин некорректен', {
        type: "error"
      })
      authBrowser.execute('loading(false)')
      break
    case 'BAD_EMAIL':
      mp.gui.notifications.show('Введите корректный email', {
        type: "error"
      })
      authBrowser.execute('loading(false)')
      break
    case 'EMAIL_BUSY':
      mp.gui.notifications.show('Данный email уже занят', {
        type: "error"
      })
      authBrowser.execute('loading(false)')
      break
    case 'LOGIN_BUSY':
      mp.gui.notifications.show('Данный логин уже занят', {
        type: "error"
      })
      authBrowser.execute('loading(false)')
      break
    case 'BAD_DATA':
      mp.gui.notifications.show('Заполнены не все поля', {
        type: "error"
      })
      authBrowser.execute('loading(false)')
      break
    case 'LOGIN_FAIL':
      mp.gui.notifications.show('Неправильный логин или пароль', {
        type: "error"
      })
      authBrowser.execute('loading(false)')
      authBrowser.execute('resetPasswordField()')
      break
    default:
      mp.gui.notifications.show('Ошибка на стороне сервера. Повторите попытку позже', {
        type: "error"
      })
      break
  }
}
