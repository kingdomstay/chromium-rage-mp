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
var db = require('../Utils/db');
var log = require('../Utils/log');
var bcrypt = require('bcryptjs');
/** 1 этап. Запрос авторизации у игрока */
mp.events.add('playerJoin', function (player) {
    // Инициализируем процедуру авторизации игрока
    playerPreAuth(player);
});
mp.events.add('S_AuthWindowLoaded', function (player) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, possibleAccounts(player)];
            case 1:
                if (_a.sent()) {
                    player.call('C_Auth-needAuth');
                }
                else {
                    player.call('C_Auth-needRegister');
                }
                return [2 /*return*/];
        }
    });
}); });
function playerPreAuth(player) {
    player.call('C_Auth-initAuth');
    player.alpha = 0;
    player.dimension = player.id + 1500;
    player.position = new mp.Vector3(-1402.4600830078125, -152.7124786376953, 47.661441802978516);
}
function possibleAccounts(player) {
    return __awaiter(this, void 0, void 0, function () {
        var socialClub, conn, rows, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    socialClub = player.socialClub;
                    return [4 /*yield*/, db.getConnection()];
                case 1:
                    conn = _a.sent();
                    return [4 /*yield*/, conn.query("SELECT id FROM users WHERE social_club=(?)", [socialClub])];
                case 2:
                    rows = _a.sent();
                    return [2 /*return*/, !!rows[0]];
                case 3:
                    err_1 = _a.sent();
                    log.error(err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/** 2 этап. Проверка авторизации или регистрация нового аккаунта */
mp.events.add('S_SendLoginCredentialsToServer', function (player, args) { return __awaiter(void 0, void 0, void 0, function () {
    var data, conn, rows, row, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                data = JSON.parse(args);
                if (!(data[0] && data[1])) {
                    player.call('C_Auth-handler', ['BAD_DATA']);
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, db.getConnection()];
            case 2:
                conn = _a.sent();
                return [4 /*yield*/, conn.query("SELECT * FROM users WHERE login=(?)", [data[0]])];
            case 3:
                rows = _a.sent();
                console.log(rows.length);
                if (rows.length == 0) {
                    player.call('C_Auth-handler', ['LOGIN_FAIL']);
                    return [2 /*return*/];
                }
                row = rows[0];
                console.log(row);
                if (!bcrypt.compareSync(data[1], row.hash_password)) {
                    player.call('C_Auth-handler', ['LOGIN_FAIL']);
                    return [2 /*return*/];
                }
                player.call('C_Auth-handler', ['SUCCESS_LOGIN']);
                mp.events.call('playerAuth', player, row);
                player.setVariable('userId', row.id);
                player.auth = true;
                player.alpha = 255;
                player.dimension = row.last_position.dimension;
                player.position = new mp.Vector3(row.last_position.x, row.last_position.y, row.last_position.z);
                return [3 /*break*/, 5];
            case 4:
                err_2 = _a.sent();
                log.error(err_2);
                player.call('C_Auth-hanlder');
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
mp.events.add('S_SendRegisterCredentialsToServer', function (player, args) { return __awaiter(void 0, void 0, void 0, function () {
    var data, regexEmail, regexLogin, regexPassword, conn, rows, salt, hash, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                data = JSON.parse(args);
                regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                regexLogin = /^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*$/;
                regexPassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
                if (!data[0].match(regexLogin)) {
                    player.call('C_Auth-handler', ['BAD_LOGIN']);
                    return [2 /*return*/];
                }
                if (!data[1].match(regexEmail)) {
                    player.call('C_Auth-handler', ['BAD_EMAIL']);
                    return [2 /*return*/];
                }
                if (data[2] != data[3]) {
                    player.call('C_Auth-handler', ['NO_EQUAL_PASSWORDS']);
                    return [2 /*return*/];
                }
                if (!data[2].match(regexPassword)) {
                    player.call('C_Auth-handler', ['BAD_PASSWORD']);
                    return [2 /*return*/];
                }
                return [4 /*yield*/, db.getConnection()];
            case 1:
                conn = _a.sent();
                return [4 /*yield*/, conn.query("SELECT id FROM users WHERE email=(?)", [data[1]])];
            case 2:
                rows = _a.sent();
                if (rows[0]) {
                    player.call('C_Auth-handler', ['EMAIL_BUSY']);
                    return [2 /*return*/];
                }
                return [4 /*yield*/, conn.query("SELECT id FROM users WHERE login=(?)", [data[0]])];
            case 3:
                rows = _a.sent();
                if (rows[0]) {
                    player.call('C_Auth-handler', ['LOGIN_BUSY']);
                    return [2 /*return*/];
                }
                salt = bcrypt.genSaltSync(10);
                hash = bcrypt.hashSync(data[2], salt);
                _a.label = 4;
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, conn.query("INSERT INTO users (login, email, hash_password, social_club) VALUES (?, ?, ?, ?)", [data[0], data[1], hash, player.socialClub])];
            case 5:
                _a.sent();
                player.call('C_Auth-handler', ['SUCCESS_REGISTER']);
                console.log(JSON.parse(args));
                return [3 /*break*/, 7];
            case 6:
                err_3 = _a.sent();
                player.call('C_Auth-handler');
                log.error(err_3);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
/** Методы */
function savePlayerLastPosition(player) {
    return __awaiter(this, void 0, void 0, function () {
        var id, lastPosition, conn, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!player.auth)
                        return [2 /*return*/];
                    id = player.getVariable('userId');
                    lastPosition = {
                        x: player.position.x,
                        y: player.position.y,
                        z: player.position.z,
                        dimension: player.dimension
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, db.getConnection()];
                case 2:
                    conn = _a.sent();
                    console.log(lastPosition);
                    return [4 /*yield*/, conn.query("UPDATE users SET last_position=(?) WHERE id=(?)", [lastPosition, id])];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_4 = _a.sent();
                    log.error(err_4);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/** События */
mp.events.add('playerQuit', savePlayerLastPosition);
