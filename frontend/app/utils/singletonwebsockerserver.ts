import { Ticker } from "./types";

export const BASE_URL = "wss://ws.backpack.exchange/";
type CallbackFunction = (data: any) => void; // Adjust this as per your expected data shape

interface CallbackObject {
    callback: CallbackFunction;
    id: string;
}

export class SignalingManager {
    private ws: WebSocket;
    private static instance: SignalingManager;
    private bufferedMessages: any[] = [];
    private callbacks: Record<string, CallbackObject[]> = {}; // Using Record type for better type safety
    private id: number;
    private initialized: boolean = false;

    private constructor() {
        this.ws = new WebSocket(BASE_URL);
        this.bufferedMessages = [];
        this.id = 1;
        this.init();
    }

    public static getInstance() {
        if (!this.instance)  {
            this.instance = new SignalingManager();
        }
        return this.instance;
    }

    init() {
        this.ws.onopen = () => {
            this.initialized = true;
            this.bufferedMessages.forEach(message => {
                this.ws.send(JSON.stringify(message));
            });
            this.bufferedMessages = [];
        }
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const type = message.data.e;
            if (this.callbacks[type]) {
                this.callbacks[type].forEach(({ callback }: { callback: CallbackFunction }) => {
                    if (typeof callback === 'function') { // Ensure the callback is a function
                        if (type === "ticker") {
                            const { c: lastPrice, h: high, l: low, v: volume, V: quoteVolume, s: symbol } = message.data || {};
                            
                            if (lastPrice && high && low && volume && quoteVolume && symbol) {
                                const newTicker: Partial<Ticker> = {
                                    lastPrice,
                                    high,
                                    low,
                                    volume,
                                    quoteVolume,
                                    symbol,
                                };
                                callback(newTicker);
                            } else {
                                console.warn('Ticker message data is incomplete:', message.data);
                            }
                        }
                        if (type === "depth") {
                            const updatedBids = message.data?.b;
                            const updatedAsks = message.data?.a;

                            if (updatedBids && updatedAsks) {
                                callback({ bids: updatedBids, asks: updatedAsks });
                            } else {
                                console.warn('Depth message data is incomplete:', message.data);
                            }
                        }
                    } else {
                        console.warn('Callback is not a function:', callback);
                    }
                });
            }
        }
    }

    sendMessage(message: any) {
        const messageToSend = {
            ...message,
            id: this.id++
        };
        if (!this.initialized) {
            this.bufferedMessages.push(messageToSend);
            return;
        }
        this.ws.send(JSON.stringify(messageToSend));
    }

    async registerCallback(type: string, callback: CallbackFunction, id: string) {
        this.callbacks[type] = this.callbacks[type] || [];
        this.callbacks[type].push({ callback, id });
    }

    async deRegisterCallback(type: string, id: string) {
        if (this.callbacks[type]) {
            const index = this.callbacks[type].findIndex((callback: { id: string; }) => callback.id === id);
            if (index !== -1) {
                this.callbacks[type].splice(index, 1);
            }
        }
    }
}