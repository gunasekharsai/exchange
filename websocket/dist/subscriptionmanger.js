"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionManager = void 0;
const redis_1 = require("redis");
const usermanager_1 = require("./usermanager");
class SubscriptionManager {
    constructor() {
        this.subscriptions = new Map();
        this.reverseSubscriptions = new Map();
        this.redisCallbackHandler = (message, channel) => {
            var _a;
            const parsedMessage = JSON.parse(message);
            (_a = this.reverseSubscriptions.get(channel)) === null || _a === void 0 ? void 0 : _a.forEach(s => { var _a; return (_a = usermanager_1.UserManager.getInstance().getUser(s)) === null || _a === void 0 ? void 0 : _a.emit(parsedMessage); });
        };
        this.redisClient = (0, redis_1.createClient)();
        this.redisClient.connect();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new SubscriptionManager();
        }
        return this.instance;
    }
    subscribe(userId, subscription) {
        var _a, _b;
        if ((_a = this.subscriptions.get(userId)) === null || _a === void 0 ? void 0 : _a.includes(subscription)) {
            return;
        }
        this.subscriptions.set(userId, (this.subscriptions.get(userId) || []).concat(subscription));
        this.reverseSubscriptions.set(subscription, (this.reverseSubscriptions.get(subscription) || []).concat(userId));
        if (((_b = this.reverseSubscriptions.get(subscription)) === null || _b === void 0 ? void 0 : _b.length) === 1) {
            this.redisClient.subscribe(subscription, this.redisCallbackHandler);
        }
    }
    unsubscribe(userId, subscription) {
        var _a;
        const subscriptions = this.subscriptions.get(userId);
        if (subscriptions) {
            this.subscriptions.set(userId, subscriptions.filter(s => s !== subscription));
        }
        const reverseSubscriptions = this.reverseSubscriptions.get(subscription);
        if (reverseSubscriptions) {
            this.reverseSubscriptions.set(subscription, reverseSubscriptions.filter(s => s !== userId));
            if (((_a = this.reverseSubscriptions.get(subscription)) === null || _a === void 0 ? void 0 : _a.length) === 0) {
                this.reverseSubscriptions.delete(subscription);
                this.redisClient.unsubscribe(subscription);
            }
        }
    }
    userLeft(userId) {
        var _a;
        console.log("user left " + userId);
        (_a = this.subscriptions.get(userId)) === null || _a === void 0 ? void 0 : _a.forEach(s => this.unsubscribe(userId, s));
    }
    getSubscriptions(userId) {
        return this.subscriptions.get(userId) || [];
    }
}
exports.SubscriptionManager = SubscriptionManager;
