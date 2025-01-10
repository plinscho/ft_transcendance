class Reactive {
    constructor (obj) {
        this.contents = obj;
        this.listeners = {};
        this.makeReactive(obj);
    }

    makeReactive(obj) {
        Object.keys(obj).forEach(prop => this.makePropReactive(obj, prop));
    }

    makePropReactive(obj, key) {
        let value = obj[key];
        const that = this;

        Object.defineProperty(obj, key, {
            get () {
                return value;
            },
            set (newValue) {
                value = newValue;
                that.notify(key);
            }
        });
    }

    listen(prop, handler) {
        if (!this.listeners[prop]) this.listeners[prop] = [];
        this.listeners[prop].push(handler);
    }

    notify(prop) {
        this.listeners[prop].forEach(listener => listener(this.contents[prop]));
    }
}

export default Reactive;
