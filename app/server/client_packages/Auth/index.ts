let authBrowser: BrowserMp
let authCamera: CameraMp

/** Preauth Step */
mp.events.add('playerReady', () => {
    authCamera = mp.cameras.new('default', new mp.Vector3(-1393.0072021484375, -157.15443420410156, 55.08986282348633), new mp.Vector3(0,0,0), 40);
    authBrowser = mp.browsers.new('package://Browsers/Auth/auth.html')

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
})
mp.events.add('browserDomReady', (browser: BrowserMp) => {
    if (browser == authBrowser) {
        mp.events.callRemote('S_AuthWindowReady')
    }
})

/** Finish Stage */
mp.events.add('playerAuth', () => {
    authCamera.destroy()
    authBrowser.destroy()
    mp.gui.cursor.show(false, false)
    mp.gui.chat.show(true)

    mp.game.ui.displayHud(true)
    mp.game.ui.displayRadar(true)
    mp.game.cam.renderScriptCams(false, false, 0, true, false);
})

/** Login */
mp.events.add('CEF_Auth-SendLoginCredentials', (data) => {
    data = JSON.parse(data)
    if (!(data.login && data.password)) return statusHanlder("EMPTY_FIELDS")

    mp.events.callRemote('S_Auth-SendLoginCredentials', JSON.stringify(data))
})

/** Register */
mp.events.add('CEF_Auth-SendRegisterCredentials', (data) => {
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    const regexLogin =   /^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*$/
    const regexPassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/
    data = JSON.parse(data)

    if (!(data.username && data.email && data.password && data.repeatPassword)) return statusHanlder("EMPTY_FIELDS")
    if (!(data.username.match(regexLogin))) return statusHanlder("LOGIN_INVALID")
    if (!(data.email.match(regexEmail))) return statusHanlder("EMAIL_INVALID")
    if (!(data.password.match(regexPassword))) return statusHanlder("PASSWORD_INVALID")
    if (data.password != data.repeatPassword) return statusHanlder("PASSWORD_NOT_EQUAL")

    mp.events.callRemote('S_Auth-SendRegisterCredentials', JSON.stringify(data))
})

/** Select character */
mp.events.add('CEF_Auth-SendSelectedCharacter', (id) => {
    mp.events.callRemote('S_Auth-SendSelectedCharacter', id)
})

/** Create character */
// TODO: Создать редактор персонажа

/** Methods */
mp.events.add('C_Auth-redirectTo', (page, data = undefined) => {
    authBrowser.execute(`redirectTo("${page}")`)
    if (page == "select-character") {
        if (data) {
            authBrowser.execute(`selectCharacter.generateCharacterCards('${data}')`)
        } else {
            authBrowser.execute(`selectCharacter.generateCharacterCards(undefined)`)
        }
    }
    if (data) {
        if (page == "login") {
            authBrowser.execute(`login.setData("${data}")`)
        }
        if (page == "error-message") {
            // TODO: Система банов
        }
    }
})
mp.events.add('C_Auth-Handler', statusHanlder)

function statusHanlder(key: string) {
    mp.console.logInfo(key)
    switch (key) {
        case "EMPTY_FIELDS":
            mp.gui.notifications.show('Заполнены не все поля', {
                type: "warning"
            })
            authBrowser.execute('lock(false)')
            break
        case "LOGIN_BAD":
            mp.gui.notifications.show('Неверное имя пользователя или пароль', {
                type: "error"
            })
            authBrowser.execute('lock(false)')
            break
        case "EMAIL_INVALID":
            mp.gui.notifications.show('Некорректный email', {
                type: "warning"
            })
            authBrowser.execute('lock(false)')
            break
        case "PASSWORD_INVALID":
            mp.gui.notifications.show('Некорректный пароль', {
                type: "warning"
            })
            authBrowser.execute(`register.clearPassword()`)
            authBrowser.execute('lock(false)')
            break
        case "PASSWORD_NOT_EQUAL":
            mp.gui.notifications.show('Пароли не совпадают', {
                type: "warning"
            })
            authBrowser.execute(`register.clearPassword()`)
            authBrowser.execute('lock(false)')
            break
        case "EMAIL_BUSY":
            mp.gui.notifications.show('Данный email уже занят', {
                type: "error"
            })
            authBrowser.execute(`register.emailBusy()`)
            authBrowser.execute('lock(false)')
            break
        case "USERNAME_BUSY":
            mp.gui.notifications.show('Данный никнейм уже занят', {
                type: "error"
            })
            authBrowser.execute(`register.usernameBusy()`)
            authBrowser.execute('lock(false)')
            break
        case "REGISTER_SUCCESS":
            mp.gui.notifications.show('Вы успешно зарегистрировались', {
                type: "success"
            })
            authBrowser.execute(`register.clearFields()`)
            authBrowser.execute('lock(false)')
            break
        case "LOGIN_SUCCESS":
            authBrowser.execute('lock(false)')
            break
        case "SС_ALREADY_CONNECTED":
            mp.gui.notifications.show('Ваш Social Club уже привязан к другому аккаунту', {
                type: "error"
            })
            mp.gui.notifications.show('Попробуйте войти в свой аккаунт', {
                type: "info"
            })
            authBrowser.execute(`redirectTo("login")`)
            authBrowser.execute(`register.clearFields()`)
            authBrowser.execute('lock(false)')
            break
        case "SELECTED_CHARACTER_NOT_YOU":
            mp.gui.notifications.show('Выбранный персонаж не принадлежит вам', {
                type: "error"
            })
            authBrowser.execute('lock(false)')
            break
        case "SELECTED_CHARACTER_SUCCESS":
            mp.gui.notifications.show('Выбранный персонаж принадлежит вам', {
                type: "info"
            })
            authBrowser.execute('lock(false)')
            break
        default:
            mp.gui.notifications.show('Неизвестная ошибка', {
                type: "error"
            })
            authBrowser.execute('lock(false)')
    }
}
