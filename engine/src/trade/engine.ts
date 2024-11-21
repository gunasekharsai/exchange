import { Orderbook } from "./orderbokk";
import fs from 'fs';
export const BASE_CURRENCY = "INR";

interface userBalance {
  [key: string]: {
    available: number;
    locked :number;
  };
}


export class Engine {

    private orderbooks : Orderbook[] = [];
    private balances:Map<string, userBalance> = new Map();

    constructor(){
        let snapshot = null;
        try{
            if(process.env.WITH_SNAPSHOT){
                snapshot = fs.readFileSync("./snapshot.json");
            }
        }catch(e){
            console.log(e);
        }
        if(snapshot){
            const snapshotData = JSON.parse(snapshot.toString());
            this.orderbooks = snapshotData.orderbooks;
            this.balances = new Map(snapshotData.balances);
        }else{
            this.orderbooks = [ new Orderbook(`TATA`, [], [],0, 0)];
            this.setBaseBalances();
        }
    }
}
