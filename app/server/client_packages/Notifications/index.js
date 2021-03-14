"use strict";
var notifyBrowser;
mp.events.add('playerReady', function () {
    notifyBrowser = mp.browsers.new('package://Browsers/Notifications/notifications.html');
});
mp.events.add('C_PlayerNotify', function (msg, options) {
    switch (options.type) {
        case "error":
            notifyBrowser.execute("error(\"" + msg + "\", " + parseInt(options.duration) + ")");
            break;
        case "warning":
            notifyBrowser.execute("warning(\"" + msg + "\", " + parseInt(options.duration) + ")");
            break;
        case "success":
            notifyBrowser.execute("success(\"" + msg + "\", " + parseInt(options.duration) + ")");
            break;
        default:
            notifyBrowser.execute("info(\"" + msg + "\", " + parseInt(options.duration) + ")");
            break;
    }
});
mp.gui.notifications = {
    show: function (msg, options) {
        if (msg === void 0) { msg = 'Notification'; }
        if (options === void 0) { options = { type: 'info', duration: 4000 }; }
        mp.events.call('C_PlayerNotify', msg, {
            type: options.type,
            duration: options.duration
        });
    }
};
