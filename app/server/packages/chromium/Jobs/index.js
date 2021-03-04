"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSalary = exports.editSalary = exports.addToSalary = exports.resetSalary = exports.getSalary = exports.isWorkHere = exports.isWork = exports.isShift = exports.endShift = exports.startShift = exports.getJobPlayerUid = exports.uninviteJob = exports.inviteJob = exports.Job = void 0;
var Job = /** @class */ (function () {
    function Job(props) {
        this.uid = props.uid;
        this.name = props.name;
        this.description = props.description;
        this.blip = mp.blips.new(props.blip.type, new mp.Vector3(props.blip.x, props.blip.y, props.blip.z), {
            color: props.blip.color,
            shortRange: true,
            dimension: 0
        });
        this.colshape = mp.colshapes.newTube(props.checkpoint.x, props.checkpoint.y, props.checkpoint.z, 2, 0.9, 0);
        this.marker = mp.markers.new(1, new mp.Vector3(props.checkpoint.x, props.checkpoint.y, props.checkpoint.z), 1, {
            dimension: 0
        });
        this.listenEvents();
    }
    Job.prototype.listenEvents = function () {
        var _this = this;
        mp.events.add('playerEnterColshape', function (player, colshape) {
            if (!player.auth)
                return;
            if (colshape != _this.colshape)
                return;
            if (player.vehicle)
                return;
            if (isWork(player)) {
                if (isWorkHere(player, _this.uid)) {
                    if (isShift(player)) {
                        return player.notify('Сначала закончите смену', { type: "error" });
                    }
                    else {
                        return uninviteJob(player);
                    }
                }
                else {
                    return player.notify('Вы уже работаете кем-то', { type: "warning" });
                }
            }
            else {
                inviteJob(player, _this.uid);
            }
        });
    };
    return Job;
}());
exports.Job = Job;
function inviteJob(player, uid) {
    player.setVariable('Job-name', uid);
    player.call('playerInviteJob', uid);
    mp.events.call('playerInviteJob', player, uid);
    player.notify('Вы устроились на работу', { type: "success" });
}
exports.inviteJob = inviteJob;
function uninviteJob(player) {
    var uid = getJobPlayerUid(player);
    player.call('playerUninviteJob', uid);
    mp.events.call('playerUninviteJob', player, uid);
    player.setVariable('Job-name', null);
    player.notify('Вы уволились с работы', { type: "success" });
}
exports.uninviteJob = uninviteJob;
function getJobPlayerUid(player) {
    return player.getVariable('Job-name');
}
exports.getJobPlayerUid = getJobPlayerUid;
function startShift(player) {
    var uid = getJobPlayerUid(player);
    player.setVariable('Job-shift', true);
    player.notify('Вы начали смену');
    player.call('playerStartShift', [uid]);
    mp.events.call('playerStartShift', [player, uid]);
}
exports.startShift = startShift;
function endShift(player) {
    var uid = getJobPlayerUid(player);
    player.setVariable('Job-shift', null);
    sendSalary(player);
    player.notify('Вы завершили смену');
    player.call('playerEndShift', [uid]);
    mp.events.call('playerEndShift', [player, uid]);
}
exports.endShift = endShift;
function isShift(player) {
    return !!player.getVariable('Job-shift');
}
exports.isShift = isShift;
function isWork(player) {
    return !!player.getVariable('Job-name');
}
exports.isWork = isWork;
function isWorkHere(player, uid) {
    return player.getVariable('Job-name') == uid;
}
exports.isWorkHere = isWorkHere;
function getSalary(player) {
    var salary = player.getVariable('Job-salary');
    if (salary == null)
        return 0;
    return salary;
}
exports.getSalary = getSalary;
function resetSalary(player) {
    player.setVariable('Job-salary', null);
}
exports.resetSalary = resetSalary;
function addToSalary(player, money) {
    var currentSalary = getSalary(player);
    player.setVariable('Job-salary', currentSalary + money);
}
exports.addToSalary = addToSalary;
function editSalary(player, money) {
    player.setVariable('Job-salary', money);
}
exports.editSalary = editSalary;
function sendSalary(player) {
    var salary = getSalary(player);
    if (salary == 0) {
        player.notify('Вы ничего не заработали', { type: "info" });
        return;
    }
    player.notify("\u0412\u044B \u0437\u0430\u0440\u0430\u0431\u043E\u0442\u0430\u043B\u0438 " + salary + "$");
    resetSalary(player);
    // TODO:
}
exports.sendSalary = sendSalary;
