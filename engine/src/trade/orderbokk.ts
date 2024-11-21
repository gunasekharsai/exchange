import { BASE_CURRENCY } from "./engine";

export interface Order {
    price: number;
    quantity: number;
    orderId: string;
    filled: number;
    side: "buy" | "sell";
    userId: string;
}

export interface Fill{
    price:string;
    quantity:number;
   tradeId:number;
   otheruserid:string;
   marketorderId:string;
}


export class Orderbook{
    asks:Order[];
    bids:Order[];
    baseAsset:string;
    quoteAsset:string = BASE_CURRENCY;
    lastTradeId :number;
    currentPrice:number;

    constructor(asks: Order[], bids:Order[], baseAsset:string, lastTradeId:number, currentPrice:number){
        this.asks = asks;
        this.bids = bids;
        this.baseAsset = baseAsset;
        this.lastTradeId = lastTradeId || 0;
        this.currentPrice = currentPrice || 0;
    }

    ticker(){
        return `${this.baseAsset} - ${this.quoteAsset}`;
    }

    getSnapshot(){
        return {
            baseAsset:this.baseAsset,
            lastTradeId:this.lastTradeId,
            currentPrice:this.currentPrice,
            asks:this.asks,
            bids:this.bids
        }
    }
    addOrder(order:Order){
        if(order.side === "buy"){
            const {executedQty, fills} =  this.matchBid(order);
            order.filled = executedQty;
            if(executedQty === order.quantity){
                return {
                    executedQty,
                    fills
                }
            }
            this.bids.push(order);
            return {
                executedQty,
                fills
            }
        }else{
            const {executedQty, fills} = this.matchAsk(order);
            order.filled = executedQty;
            if(executedQty === order.quantity){
                return {
                    executedQty,
                    fills
                }
            }
            this.asks.push(order);
            return {
                executedQty,
                fills
            }
        }
    }

    matchBid(order:Order):{
        fills: Fill[],
        executedQty: number
    }{
        const fills : Fill[] = [];

        let executedQty = 0;
        for(let i = 0;i<this.asks.length;i++){
            if(this.asks[i].price <= order.price && executedQty<order.quantity){
                const filledQty = Math.min(this.asks[i].quantity, order.quantity - executedQty);
                executedQty+=filledQty;
                this.asks[i].quantity -= filledQty;
                fills.push({
                    price : this.asks[i].price.toString(),
                    quantity:filledQty,
                    tradeId:this.lastTradeId++,
                    otheruserid:this.asks[i].userId,
                    marketorderId:this.asks[i].orderId
                })
            }
        }

        for(let i = 0;i<this.asks.length;i++){
            if(this.asks[i].filled ===  this.asks[i].quantity){
                this.asks.splice(i, 1);
                i--;
            }
        }
        return {
            fills, executedQty
        };
    }

    matchAsk(order:Order):{
        fills: Fill[],
        executedQty:number
    }
        {
        const fills:Fill[] = [];
        let executedQty = 0;
        for(let i = 0;i<this.bids.length;i++){
            if(this.bids[i].price >= order.price && executedQty<order.quantity){
                const filledQty = Math.min(this.bids[i].quantity, order.quantity - executedQty);
                executedQty+=filledQty;
                this.bids[i].quantity -= filledQty;
                fills.push({
                    price : this.bids[i].price.toString(),
                    quantity:filledQty,
                    tradeId:this.lastTradeId++,
                    otheruserid:this.bids[i].userId,
                    marketorderId:this.bids[i].orderId
                })
            }
        }

        for(let i =0;i<this.bids.length;i++){
            if(this.bids[i].filled === this.bids[i].quantity){
                this.bids.splice(i, 1);
                i--;
            }
        }

        return {
            fills,
            executedQty
        };
    }

    getDepth(){
        const bids : [string, string][] = [];
        const asks : [string, string][] = [];

        const bidsObj: {[ket:string]:number} = {};
        const asksObj: {[ket:string]:number} = {};
        for(let i = 0;i<this.bids.length;i++){
            const order  = this.bids[i];
            if(!bidsObj[order.price]){
                bidsObj[order.price] = 0;
            }
            bidsObj[order.price] += order.quantity;
        }

        for(let i = 0;i<this.asks.length;i++){
            const order  = this.asks[i];
            if(!asksObj[order.price]){
                asksObj[order.price] = 0;
            }
            asksObj[order.price] += order.quantity;
        }

        for(let price in bidsObj){
            bids.push([price, bidsObj[price].toString()]);
        }
        for(let price in asksObj){
            asks.push([price, asksObj[price].toString()]);
        }

        return {
            bids,
            asks
        }
    }

    getOpenOrders(userId: string): Order[] {
        const asks = this.asks.filter(x => x.userId === userId);
        const bids = this.bids.filter(x => x.userId === userId);
        return [...asks, ...bids];
    }

    cancelBid(order: Order) {
        const index = this.bids.findIndex(x => x.orderId === order.orderId);
        if (index !== -1) {
            const price = this.bids[index].price;
            this.bids.splice(index, 1);
            return price
        }
    }

    cancelAsk(order: Order) {
        const index = this.asks.findIndex(x => x.orderId === order.orderId);
        if (index !== -1) {
            const price = this.asks[index].price;
            this.asks.splice(index, 1);
            return price
        }     
    }

}


