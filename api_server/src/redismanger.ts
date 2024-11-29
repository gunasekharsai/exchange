import { createClient, RedisClientType } from "redis"
import { MessageFromOrderbook } from "./types";
import { MessageToEngine } from "./types/to";




export class Redismanger {
    private client:RedisClientType;
    private publisher:RedisClientType;
    private static instace:Redismanger;


    private constructor(){
        this.client = createClient();
        this.client.connect();
        this.publisher = createClient();
        this.publisher.connect();
    }

    public static getInstance(){
        if(!this.instace){
            this.instace = new Redismanger();
        }
        return this.instace;
    }

    public sendAndAwait(message:MessageToEngine){
        return new Promise<MessageFromOrderbook>((resolve) => {
            console.log("inside sendAndAwait");
            const id = this.getRandomClientId();
             this.client.subscribe(id, (message) => {
                this.client.unsubscribe(id);
                console.log("inside sendAndAwait2");
                resolve(JSON.parse(message));
            });
            console.log("inside sendAndAwait3");
            this.publisher.lPush("messages", JSON.stringify({ clientId: id, message }));
        });
    }

    public getRandomClientId(){
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}