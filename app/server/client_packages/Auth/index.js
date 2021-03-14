"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var authBrowser;
var authCamera;
/** Preauth Step */
mp.events.add('playerReady', function () {
    authCamera = mp.cameras.new('default', new mp.Vector3(-1393.0072021484375, -157.15443420410156, 55.08986282348633), new mp.Vector3(0, 0, 0), 40);
    authBrowser = mp.browsers.new('package://Browsers/Auth/auth.html');
    authCamera.pointAtCoord(-1542.977294921875, -77.08079528808594, 64.43563079833984);
    authCamera.setActive(true);
    mp.game.cam.renderScriptCams(true, false, 0, true, false);
    setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            mp.gui.cursor.visible = true;
            return [2 /*return*/];
        });
    }); }, 0);
    mp.gui.cursor.show(true, true);
    mp.gui.chat.show(false);
    mp.game.ui.displayHud(false);
    mp.game.ui.displayRadar(false);
});
mp.events.add('browserDomReady', function (browser) {
    if (browser == authBrowser) {
        mp.events.callRemote('S_AuthWindowReady');
    }
});
/** Finish Stage */
mp.events.add('playerAuth', function () {
    authCamera.destroy();
    authBrowser.destroy();
    mp.gui.cursor.show(false, false);
    mp.gui.chat.show(true);
    mp.game.ui.displayHud(true);
    mp.game.ui.displayRadar(true);
    mp.game.cam.renderScriptCams(false, false, 0, true, false);
});
/** Login */
mp.events.add('CEF_Auth-SendLoginCredentials', function (data) {
    data = JSON.parse(data);
    if (!(data.login && data.password))
        return statusHanlder("EMPTY_FIELDS");
    mp.events.callRemote('S_Auth-SendLoginCredentials', JSON.stringify(data));
});
/** Register */
mp.events.add('CEF_Auth-SendRegisterCredentials', function (data) {
    var regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var regexLogin = /^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*$/;
    var regexPassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
    data = JSON.parse(data);
    if (!(data.username && data.email && data.password && data.repeatPassword))
        return statusHanlder("EMPTY_FIELDS");
    if (!(data.username.match(regexLogin)))
        return statusHanlder("LOGIN_INVALID");
    if (!(data.email.match(regexEmail)))
        return statusHanlder("EMAIL_INVALID");
    if (!(data.password.match(regexPassword)))
        return statusHanlder("PASSWORD_INVALID");
    if (data.password != data.repeatPassword)
        return statusHanlder("PASSWORD_NOT_EQUAL");
    mp.events.callRemote('S_Auth-SendRegisterCredentials', JSON.stringify(data));
});
/** Select character */
mp.events.add('CEF_Auth-SendSelectedCharacter', function (id) {
    mp.events.callRemote('S_Auth-SendSelectedCharacter', id);
});
/** Create character */
// TODO: Создать редактор персонажа
/** Methods */
mp.events.add('C_Auth-redirectTo', function (page, data) {
    if (data === void 0) { data = undefined; }
    authBrowser.execute("redirectTo(\"" + page + "\")");
    if (page == "select-character") {
        if (data) {
            authBrowser.execute("selectCharacter.generateCharacterCards('" + data + "')");
        }
        else {
            authBrowser.execute("selectCharacter.generateCharacterCards(undefined)");
        }
    }
    if (data) {
        if (page == "login") {
            authBrowser.execute("login.setData(\"" + data + "\")");
        }
        if (page == "error-message") {
            // TODO: Система банов
        }
    }
});
mp.events.add('C_Auth-Handler', statusHanlder);
function statusHanlder(key) {
    mp.console.logInfo(key);
    switch (key) {
        case "EMPTY_FIELDS":
            mp.gui.notifications.show('Заполнены не все поля', {
                type: "warning"
            });
            authBrowser.execute('lock(false)');
            break;
        case "LOGIN_BAD":
            mp.gui.notifications.show('Неверное имя пользователя или пароль', {
                type: "error"
            });
            authBrowser.execute('lock(false)');
            break;
        case "EMAIL_INVALID":
            mp.gui.notifications.show('Некорректный email', {
                type: "warning"
            });
            authBrowser.execute('lock(false)');
            break;
        case "PASSWORD_INVALID":
            mp.gui.notifications.show('Некорректный пароль', {
                type: "warning"
            });
            authBrowser.execute("register.clearPassword()");
            authBrowser.execute('lock(false)');
            break;
        case "PASSWORD_NOT_EQUAL":
            mp.gui.notifications.show('Пароли не совпадают', {
                type: "warning"
            });
            authBrowser.execute("register.clearPassword()");
            authBrowser.execute('lock(false)');
            break;
        case "EMAIL_BUSY":
            mp.gui.notifications.show('Данный email уже занят', {
                type: "error"
            });
            authBrowser.execute("register.emailBusy()");
            authBrowser.execute('lock(false)');
            break;
        case "USERNAME_BUSY":
            mp.gui.notifications.show('Данный никнейм уже занят', {
                type: "error"
            });
            authBrowser.execute("register.usernameBusy()");
            authBrowser.execute('lock(false)');
            break;
        case "REGISTER_SUCCESS":
            mp.gui.notifications.show('Вы успешно зарегистрировались', {
                type: "success"
            });
            authBrowser.execute("register.clearFields()");
            authBrowser.execute('lock(false)');
            break;
        case "LOGIN_SUCCESS":
            authBrowser.execute('lock(false)');
            break;
        case "SС_ALREADY_CONNECTED":
            mp.gui.notifications.show('Ваш Social Club уже привязан к другому аккаунту', {
                type: "error"
            });
            mp.gui.notifications.show('Попробуйте войти в свой аккаунт', {
                type: "info"
            });
            authBrowser.execute("redirectTo(\"login\")");
            authBrowser.execute("register.clearFields()");
            authBrowser.execute('lock(false)');
            break;
        case "SELECTED_CHARACTER_NOT_YOU":
            mp.gui.notifications.show('Выбранный персонаж не принадлежит вам', {
                type: "error"
            });
            authBrowser.execute('lock(false)');
            break;
        case "SELECTED_CHARACTER_SUCCESS":
            mp.gui.notifications.show('Выбранный персонаж принадлежит вам', {
                type: "info"
            });
            authBrowser.execute('lock(false)');
            break;
        default:
            mp.gui.notifications.show('Неизвестная ошибка', {
                type: "error"
            });
            authBrowser.execute('lock(false)');
    }
}
