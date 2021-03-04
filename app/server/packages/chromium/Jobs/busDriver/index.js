"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
var vehicles = require('./buses.json');
var penalty = 0.9;
var options = {
    uid: 'busDriver',
    name: 'Водитель автобуса',
    blip: {
        x: 436.9834289550781, y: -623.0693359375, z: 27.708667755126953,
        type: 513,
        color: 51
    },
    checkpoint: {
        x: 436.9834289550781, y: -623.0693359375, z: 27.708667755126953
    },
};
var data = {
    options: options,
    vehicles: vehicles
};
// TODO: Добавить GUI маршрутоуказателя
var BusDriver = /** @class */ (function (_super) {
    __extends(BusDriver, _super);
    function BusDriver(props) {
        var _this = _super.call(this, props.options) || this;
        _this.spawnVehicles(props.vehicles);
        return _this;
    }
    BusDriver.prototype.spawnVehicles = function (buses) {
        var i = 0;
        for (var _i = 0, buses_1 = buses; _i < buses_1.length; _i++) {
            var bus = buses_1[_i];
            i = i + 1;
            var numberPlate = i.toString();
            if (numberPlate.length < 2) {
                numberPlate = "0" + numberPlate;
            }
            var veh = mp.vehicles.new(mp.joaat('bus'), new mp.Vector3(bus.transform.x, bus.transform.y, bus.transform.z), {
                numberPlate: "LSBUS" + numberPlate,
            });
            veh.setColorRGB(170, 58, 98, 255, 255, 255);
            veh.rotation = new mp.Vector3(bus.rotate.x, bus.rotate.y, bus.rotate.z);
            veh.setVariable('Job-name', options.uid);
            veh.setVariable('Job-spawnPosition', { x: bus.transform.x, y: bus.transform.y, z: bus.transform.z, xRot: bus.rotate.x, yRot: bus.rotate.y, zRot: bus.rotate.z });
        }
    };
    BusDriver.prototype.initWork = function (player) {
        player.outputChatBox("\u0414\u043B\u044F \u043D\u0430\u0447\u0430\u043B\u0430 \u0441\u043C\u0435\u043D\u044B \u0437\u0430\u0439\u043C\u0438\u0442\u0435 \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0439 \u0430\u0432\u0442\u043E\u0431\u0443\u0441.");
    };
    return BusDriver;
}(index_1.Job));
var busDriver = new BusDriver(data);
mp.events.add('playerInviteJob', function (player, uid) {
    if (uid != options.uid)
        return;
    busDriver.initWork(player);
});
mp.events.add('playerEnterVehicle', function (player, vehicle) {
    if (!isBusJob(vehicle))
        return;
    if (player.seat == 0) { // Если игрок садится на место водителя
        if (index_1.isWorkHere(player, options.uid)) { // Если игрок работает здесь
            if (busRented(vehicle) != null) { // Если автобус уже арендован
                if (busRented(vehicle) == player.id) { // Если автобус арендован самим игроком
                    playerSitInBus(player);
                    player.notify('Вы можете продолжать ехать', { type: "info" });
                }
                else { // Если автобус арендован не этим игроком
                    player.notify('Это не ваш автобус', { type: "warning" });
                }
            }
            else { // Если автобус не арендован
                if (getRentedBus(player) != null) { // Если игрок уже арендует один из автобусов
                    player.removeFromVehicle();
                    player.notify('Вы уже арендуете один из автобусов');
                }
                else { // Успешное условие
                    rentBus(player, vehicle);
                    index_1.startShift(player);
                    playerSitInBus(player);
                }
            }
        }
        else { // Если игрок не работает здесь
            player.notify('У вас нет доступа к этому транспорту', { type: "error" });
            player.removeFromVehicle();
        }
    }
    else { // Если игрок садится как пассажир
        // TODO: Добавить систему оплаты билетов для пассажиров атвобуса
    }
});
mp.events.add('playerExitVehicle', function (player, vehicle) {
    if (!isBusJob(vehicle))
        return;
    if (player.seat == 0) {
        if (index_1.isWorkHere(player, options.uid)) {
            if (busRented(vehicle) == player.id) {
                playerLeaveBus(player);
                player.notify('У вас есть 60 секунд для того, чтобы сесть обратно в автобус', { type: "warning", duration: 7000 });
            }
        }
    }
    else {
        // TODO: Добавить систему оплаты билетов для пассажиров атвобуса
    }
});
mp.events.add('S_Job-busDriver__completeLap', function (player, money) {
    index_1.addToSalary(player, money);
});
mp.events.add('S_Job-busDriver__setCounter', function (player, state) {
    setCounter(player, state);
});
mp.events.add('S_Job-busDriver__endShift', function (player, state) {
    busEndShift(player, state);
});
function setCounter(player, state) {
    if (state === void 0) { state = true; }
    player.setVariable('Job-busDriver__counterActive', state);
}
function isBusJob(vehicle) {
    return vehicle.getVariable('Job-name') == options.uid;
}
function busRented(vehicle) {
    return vehicle.getVariable('Job-rentedBy');
}
function getRentedBus(player) {
    return player.getVariable('Job-busDriver__vehicle');
}
function rentBus(player, vehicle) {
    vehicle.setVariable('Job-rentedBy', player.id);
    player.setVariable('Job-busDriver__vehicle', vehicle);
    player.call('C_Job-busDriver__playerRentBus', '002'); // TODO: Зарандомить маршрут
    player.notify('Вы арендовали автобус', { type: "info" });
}
function unrentBus(player) {
    var vehicle = player.getVariable('Job-busDriver__vehicle');
    player.setVariable('Job-busDriver__vehicle', null);
    vehicle.setVariable('Job-rentedBy', null);
    var position = vehicle.getVariable('Job-spawnPosition');
    vehicle.spawn(new mp.Vector3(position.x, position.y, position.z), 1);
    vehicle.rotation = new mp.Vector3(position.xRot, position.yRot, position.zRot);
}
function playerSitInBus(player) {
    player.call('C_Job-busDriver__playerSitBus');
}
function playerLeaveBus(player) {
    player.call('C_Job-busDriver__playerLeaveBus');
}
function busEndShift(player, failed) {
    if (failed === void 0) { failed = false; }
    var currentSalary = index_1.getSalary(player);
    if (failed) {
        if (currentSalary == 0) {
            player.notify('Вы ничего не заработали и не закончили маршрут. Вам выдано предупреждение.');
            // TODO:
        }
        else {
            player.notify('Вам выдан штраф в 10% от суммы выданной зарплаты');
            index_1.editSalary(player, currentSalary * penalty);
        }
        index_1.endShift(player);
    }
    else {
        index_1.endShift(player);
    }
    unrentBus(player);
}
