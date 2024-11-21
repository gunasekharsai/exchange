import RedisClient from "@redis/client/dist/lib/client";
import { createClient, RedisClientType } from "redis";
import { WsMessage } from "./types/tows";
import { MessageToApi } from "./types/toapi";
import { ORDER_UPDATE, TRADE_ADDED } from "./types";


type DbMessage = {
    type: typeof TRADE_ADDED

    data: {
        id: string,
        isBuyerMaker: boolean,
        price: string,
        quantity: string,
        quoteQuantity: string,
        timestamp: number,
        market: string
    }
} | {
    type: typeof ORDER_UPDATE,
    data: {
        orderId: string,
        executedQty: number,
        market?: string,
        price?: string,
        quantity?: string,
        side?: "buy" | "sell",
    }
}
export class Redismanager {
    private client:RedisClientType;
    private static instance : Redismanager;

    constructor(){
        this.client = createClient();
        this.client.connect();
    }

    public static getInstance() {
        if(!this.instance){
            this.instance = new Redismanager();
        }
        return this.instance;
    }
    public pushMessage(message:DbMessage){
        this.client.lPush("dbprocessor", JSON.stringify(message));
    }

    public publishMessage(channel:string, message:WsMessage){
        this.client.publish(channel, JSON.stringify(message));
    }

    public sendtoapi(clientID:string, message: MessageToApi){
        this.client.publish(clientID, JSON.stringify(message));
    }
}
