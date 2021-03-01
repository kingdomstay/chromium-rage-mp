"use strict";
var notifyBrowser = mp.browsers.new('package://Browsers/Notifications/notifications.html');
mp.events.add('C_PlayerNotify', function (msg, type) {
    switch (type) {
        case "error":
            notifyBrowser.execute("error(\"" + msg + "\")");
            break;
        case "warning":
            notifyBrowser.execute("warning(\"" + msg + "\")");
            break;
        case "success":
            notifyBrowser.execute("success(\"" + msg + "\")");
            break;
        default:
            notifyBrowser.execute("info(\"" + msg + "\")");
            break;
    }
});
mp.gui.notifications = {
    show: function (msg, type) {
        if (msg === void 0) { msg = 'Notification'; }
        if (type === void 0) { type = 'info'; }
        mp.events.call('C_PlayerNotify', msg, type);
    }
};
