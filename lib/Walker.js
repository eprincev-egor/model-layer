"use strict";

class Walker {
    exit() {
        this._exited = true;
    }

    isExited() {
        return this._exited;
    }

    continue() {
        this._continued = true;
    }

    isContinued() {
        return this._continued;
    }
}

module.exports = Walker;