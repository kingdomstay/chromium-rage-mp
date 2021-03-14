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
Object.defineProperty(exports, "__esModule", { value: true });
var chalk = require('chalk');
var db = require('../Utils/db');
var log = require('../Utils/log');
var bcrypt = require('bcryptjs');
/** Preauth */
mp.events.add('S_AuthWindowReady', playerReady);
function playerReady(player) {
    player.alpha = 0;
    player.dimension = player.id + 1000;
    player.position = new mp.Vector3(-1402.4600830078125, -152.7124786376953, 47.661441802978516);
    getPossibleAccount(player).then(function (r) {
        if (r) {
            player.call('C_Auth-redirectTo', ['login', r]);
        }
        else {
            player.call('C_Auth-redirectTo', ['register']);
        }
    });
}
/** Finish auth */
mp.events.add('playerAuth', playerAuth);
function playerAuth(player) {
    player.alpha = 255;
    player.dimension = 0;
    player.position = new mp.Vector3(-1402.4600830078125, -152.7124786376953, 47.661441802978516);
}
/** Login */
mp.events.add('S_Auth-SendLoginCredentials', function (player, data) {
    data = JSON.parse(data);
    tryLoginUser(player, data);
});
function tryLoginUser(player, data) {
    return __awaiter(this, void 0, void 0, function () {
        var conn, profiles, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, db.getConnection()];
                case 1:
                    conn = _a.sent();
                    return [4 /*yield*/, conn.query("SELECT id, password_hash FROM users WHERE username=? OR email=?", [data.login, data.login])];
                case 2:
                    profiles = _a.sent();
                    if (profiles.length == 0)
                        return [2 /*return*/, player.call('C_Auth-Handler', ["LOGIN_BAD"])];
                    if (!bcrypt.compareSync(data.password, profiles[0].password_hash))
                        return [2 /*return*/, player.call('C_Auth-Handler', ["LOGIN_BAD"])
                            // TODO: Система банов
                        ];
                    // TODO: Система банов
                    loginUser(player, profiles[0], conn);
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    log.error(e_1);
                    return [2 /*return*/, player.call('C_Auth-Handler')];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function loginUser(player, profile, conn) {
    return __awaiter(this, void 0, void 0, function () {
        var characters, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    return [4 /*yield*/, conn.query("SELECT id, first_name, last_name FROM characters WHERE profile_id=?", [profile.id])];
                case 1:
                    characters = _a.sent();
                    player.profileId = profile.id;
                    player.call('C_Auth-Handler', ["LOGIN_SUCCESS"]);
                    if (characters.length == 0) {
                        player.call('C_Auth-redirectTo', ["select-character"]);
                    }
                    else {
                        player.call('C_Auth-redirectTo', ["select-character", JSON.stringify(characters)]);
                    }
                    return [3 /*break*/, 4];
                case 2:
                    e_2 = _a.sent();
                    log.error(e_2);
                    return [2 /*return*/, player.call('C_Auth-Handler')];
                case 3:
                    conn.end();
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/** Register */
mp.events.add('S_Auth-SendRegisterCredentials', function (player, data) {
    data = JSON.parse(data);
    data.regIp = player.ip;
    data.socialClub = player.rgscId;
    tryRegisterUser(player, data);
});
function tryRegisterUser(player, data) {
    return __awaiter(this, void 0, void 0, function () {
        var regexEmail, regexLogin, regexPassword, conn, profiles, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                    regexLogin = /^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*$/;
                    regexPassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
                    if (!(data.username && data.email && data.password && data.repeatPassword))
                        return [2 /*return*/];
                    if (!(data.username.match(regexLogin)))
                        return [2 /*return*/];
                    if (!(data.email.match(regexEmail)))
                        return [2 /*return*/];
                    if (!(data.password.match(regexPassword)))
                        return [2 /*return*/];
                    if (data.password != data.repeatPassword)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, db.getConnection()];
                case 2:
                    conn = _a.sent();
                    return [4 /*yield*/, conn.query("SELECT id  FROM users WHERE email=?", [data.email])];
                case 3:
                    profiles = _a.sent();
                    if (profiles.length > 0)
                        return [2 /*return*/, player.call('C_Auth-Handler', ["EMAIL_BUSY"])];
                    return [4 /*yield*/, conn.query("SELECT id FROM users WHERE username=?", [data.username])];
                case 4:
                    profiles = _a.sent();
                    if (profiles.length > 0) {
                        return [2 /*return*/, player.call('C_Auth-Handler', ["USERNAME_BUSY"])];
                    }
                    return [4 /*yield*/, conn.query("SELECT id FROM users WHERE social_club=?", [data.socialClub])];
                case 5:
                    profiles = _a.sent();
                    if (profiles.length > 0) {
                        return [2 /*return*/, player.call('C_Auth-Handler', ["SС_ALREADY_CONNECTED"])];
                    }
                    registerUser(player, data);
                    return [3 /*break*/, 8];
                case 6:
                    e_3 = _a.sent();
                    log.error(e_3);
                    return [2 /*return*/, player.call('C_Auth-Handler')];
                case 7:
                    if (conn)
                        conn.end();
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function registerUser(player, data) {
    return __awaiter(this, void 0, void 0, function () {
        var salt, passwordHash, conn, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    salt = bcrypt.genSaltSync(10);
                    passwordHash = bcrypt.hashSync(data.password, salt);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, db.getConnection()];
                case 2:
                    conn = _a.sent();
                    return [4 /*yield*/, conn.query('INSERT INTO users (username, password_hash, email, social_club, reg_ip) VALUES (?, ?, ?, ?, INET_ATON(?))', [data.username, passwordHash, data.email, data.socialClub, data.regIp])];
                case 3:
                    _a.sent();
                    player.call('C_Auth-Handler', ["REGISTER_SUCCESS"]);
                    player.call('C_Auth-redirectTo', ["login", data.username]);
                    return [3 /*break*/, 6];
                case 4:
                    e_4 = _a.sent();
                    log.error(e_4);
                    return [2 /*return*/, player.call('C_Auth-Handler')];
                case 5:
                    if (conn)
                        conn.end();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/** Select character */
mp.events.add('S_Auth-SendSelectedCharacter', trySelectCharacter);
function trySelectCharacter(player, id) {
    return __awaiter(this, void 0, void 0, function () {
        var profileId, conn, character, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    profileId = player.profileId;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, db.getConnection()];
                case 2:
                    conn = _a.sent();
                    return [4 /*yield*/, conn.query("SELECT * FROM characters WHERE id=? AND profile_id=?", [id, profileId])];
                case 3:
                    character = _a.sent();
                    if (character.length != 1)
                        return [2 /*return*/, player.call('C_Auth-Handler', ["SELECTED_CHARACTER_NOT_YOU"])];
                    selectCharacter(player, character[0]);
                    return [3 /*break*/, 6];
                case 4:
                    e_5 = _a.sent();
                    log.error(e_5);
                    return [2 /*return*/, player.call('C_Auth-Handler')];
                case 5:
                    if (conn)
                        conn.end();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function selectCharacter(player, character) {
    return __awaiter(this, void 0, void 0, function () {
        var spawnPosition, e_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    player.characterId = character.id;
                    player.firstName = character.first_name;
                    player.lastName = character.last_name;
                    player.name = player.firstName + " " + player.lastName;
                    player.auth = true;
                    player.call('C_Auth-Handler', ["SELECTED_CHARACTER_SUCCESS"]);
                    /******************************************************************/
                    player.call('playerAuth'); // Установить в другое место после добавления функционала
                    mp.events.call('playerAuth', (player)); // Установить в другое место после добавления функционала
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getLastPosition(player.characterId)];
                case 2:
                    spawnPosition = _a.sent();
                    if (spawnPosition) {
                        player.spawn(new mp.Vector3(spawnPosition.x, spawnPosition.y, spawnPosition.z));
                        player.dimension = spawnPosition.dimension;
                    }
                    else {
                        player.spawn(new mp.Vector3(-1658.22509765625, 236.318115234375, 62.390960693359375));
                        player.dimension = 0;
                    }
                    return [3 /*break*/, 4];
                case 3:
                    e_6 = _a.sent();
                    log.error(e_6);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/** Create character */
// TODO: Создать редактор персонажа
/** Методы */
function getPossibleAccount(player) {
    return __awaiter(this, void 0, void 0, function () {
        var conn, profiles, e_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    return [4 /*yield*/, db.getConnection()];
                case 1:
                    conn = _a.sent();
                    return [4 /*yield*/, conn.query("SELECT id, username FROM users WHERE social_club=?", [player.rgscId])];
                case 2:
                    profiles = _a.sent();
                    if (profiles[0]) {
                        return [2 /*return*/, profiles[0].username];
                    }
                    else {
                        return [2 /*return*/, null];
                    }
                    return [3 /*break*/, 5];
                case 3:
                    e_7 = _a.sent();
                    log.error(e_7);
                    return [2 /*return*/, player.call('C_Auth-Handler')];
                case 4:
                    if (conn)
                        conn.end();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function getLastPosition(characterId) {
    return __awaiter(this, void 0, void 0, function () {
        var conn, character, e_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(characterId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, db.getConnection()];
                case 2:
                    conn = _a.sent();
                    return [4 /*yield*/, conn.query("SELECT last_position FROM characters WHERE id=?", [characterId])];
                case 3:
                    character = _a.sent();
                    if (character.length != 0) {
                        return [2 /*return*/, JSON.parse(character[0].last_position)];
                    }
                    else {
                        return [2 /*return*/, 0];
                    }
                    return [3 /*break*/, 6];
                case 4:
                    e_8 = _a.sent();
                    log.error(e_8);
                    return [3 /*break*/, 6];
                case 5:
                    conn.end();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function setLastPosition(player) {
    return __awaiter(this, void 0, void 0, function () {
        var conn, position, character, e_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    position = ({
                        x: player.position.x,
                        y: player.position.y,
                        z: player.position.z,
                        xRot: 0,
                        yRot: 0,
                        zRot: 0,
                        dimension: player.dimension
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, db.getConnection()];
                case 2:
                    conn = _a.sent();
                    return [4 /*yield*/, conn.query("INSERT INTO characters (last_position) VALUES (?) WHERE id=?", [JSON.stringify(position), player.characterId])];
                case 3:
                    character = _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    e_9 = _a.sent();
                    log.error(e_9);
                    return [3 /*break*/, 6];
                case 5:
                    conn.end();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
console.log(chalk.green('[SERVICE]'), 'Authentication loaded');
