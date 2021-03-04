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
var regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
var regexLogin = /^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*$/;
var regexPassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
var authBrowser = mp.browsers.new('package://Browsers/Auth/auth.html');
var authCamera = mp.cameras.new('default', new mp.Vector3(-1393.0072021484375, -157.15443420410156, 55.08986282348633), new mp.Vector3(0, 0, 0), 40);
/** Server Zone */
mp.events.add('C_Auth-initAuth', function () {
    preAuth();
});
mp.events.add('C_Auth-needAuth', function () {
    setTimeout(function () {
        authBrowser.execute('redirectToSlide("login")');
    }, 2000);
});
mp.events.add('C_Auth-needRegister', function () {
    setTimeout(function () {
        authBrowser.execute('redirectToSlide("register")');
    }, 2000);
});
mp.events.add('C_AuthWindowLoaded', function () {
    mp.events.callRemote('S_AuthWindowLoaded');
});
mp.events.add('C_Auth-handler', function (key) {
    switch (key) {
        case 'SUCCESS_LOGIN':
            mp.gui.notifications.show('Вы вошли в аккаунт', {
                type: "success"
            });
            authorizated();
            break;
        case 'SUCCESS_REGISTER':
            mp.gui.notifications.show('Вы успешно зарегистрировались', {
                type: "success"
            });
            authBrowser.execute('playerRegistered()');
            break;
        default:
            errorHandler(key);
            break;
    }
});
/** CEF Zone */
mp.events.add('C_SendLoginCredentialsToClient', function (args) {
    // TODO: Добавить обработчик ошибок при пользовательском вводе
    mp.events.callRemote('S_SendLoginCredentialsToServer', args);
});
mp.events.add('C_SendRegisterCredentialsToClient', tryRegister);
/** Methods Zone */
function preAuth() {
    var _this = this;
    authCamera.pointAtCoord(-1542.977294921875, -77.08079528808594, 64.43563079833984);
    authCamera.setActive(true);
    mp.game.cam.renderScriptCams(true, false, 0, true, false);
    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            mp.gui.cursor.visible = true;
            return [2 /*return*/];
        });
    }); }, 0);
    mp.gui.cursor.show(true, true);
    mp.gui.chat.show(false);
    mp.game.ui.displayHud(false);
    mp.game.ui.displayRadar(false);
}
function authorizated() {
    var _this = this;
    mp.game.cam.renderScriptCams(false, false, 0, true, false);
    authCamera.destroy();
    authBrowser.destroy();
    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            mp.gui.cursor.visible = false;
            return [2 /*return*/];
        });
    }); }, 0);
    mp.gui.cursor.show(false, false);
    mp.gui.chat.show(true);
    mp.game.ui.displayHud(true);
    mp.game.ui.displayRadar(true);
}
function tryRegister(args) {
    var data = JSON.parse(args);
    if (!(data[0] && data[1] && data[2] && data[3])) {
        errorHandler('BAD_DATA');
        return;
    }
    if (!data[0].match(regexLogin)) {
        errorHandler('BAD_LOGIN');
        return;
    }
    if (!data[1].match(regexEmail)) {
        errorHandler('BAD_EMAIL');
        return;
    }
    if (data[2] != data[3]) {
        errorHandler('NO_EQUAL_PASSWORDS');
        return;
    }
    if (!data[2].match(regexPassword)) {
        errorHandler('BAD_PASSWORD');
        return;
    }
    mp.events.callRemote('S_SendRegisterCredentialsToServer', args);
}
function tryLogin(args) {
    var data = JSON.parse(args);
    if (!(data[0] && data[1])) {
        errorHandler('BAD_DATA');
        return;
    }
    mp.events.callRemote('S_SendLoginCredentialsToServer', args);
}
function errorHandler(key) {
    switch (key) {
        case 'NO_EQUAL_PASSWORDS':
            mp.gui.notifications.show('Пароли не совпадают', {
                type: "error"
            });
            authBrowser.execute('loading(false)');
            break;
        case 'BAD_PASSWORD':
            mp.gui.notifications.show('Пароль небезопасен, введите другой пароль', {
                type: "error"
            });
            authBrowser.execute('loading(false)');
            break;
        case 'WRONG_PASSWORD':
            mp.gui.notifications.show('Неверный пароль', {
                type: "error"
            });
            authBrowser.execute('loading(false)');
            break;
        case 'BAD_LOGIN':
            mp.gui.notifications.show('Логин некорректен', {
                type: "error"
            });
            authBrowser.execute('loading(false)');
            break;
        case 'BAD_EMAIL':
            mp.gui.notifications.show('Введите корректный email', {
                type: "error"
            });
            authBrowser.execute('loading(false)');
            break;
        case 'EMAIL_BUSY':
            mp.gui.notifications.show('Данный email уже занят', {
                type: "error"
            });
            authBrowser.execute('loading(false)');
            break;
        case 'LOGIN_BUSY':
            mp.gui.notifications.show('Данный логин уже занят', {
                type: "error"
            });
            authBrowser.execute('loading(false)');
            break;
        case 'BAD_DATA':
            mp.gui.notifications.show('Заполнены не все поля', {
                type: "error"
            });
            authBrowser.execute('loading(false)');
            break;
        case 'LOGIN_FAIL':
            mp.gui.notifications.show('Неправильный логин или пароль', {
                type: "error"
            });
            authBrowser.execute('loading(false)');
            authBrowser.execute('resetPasswordField()');
            break;
        default:
            mp.gui.notifications.show('Ошибка на стороне сервера. Повторите попытку позже', {
                type: "error"
            });
            break;
    }
}
