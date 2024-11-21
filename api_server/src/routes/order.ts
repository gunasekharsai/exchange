import {Router} from "express";
import { Redismanger } from "../redismanger";
export const orderRouter = Router();


orderRouter.post("/", async (req, res) =>{
    const {market, price, quantity, side, userId} = req.body;

    console.log(req.body);
    // creating an order
    const response = await Redismanger.getInstance().sendAndAwait({
        type: "CREATE_ORDER",
        data: {
            market,
            price,
            quantity,
            side,
            userId
        }
    });
    res.json(response.payload);
})

orderRouter.delete("/cancel", async (req, res) =>{
    const {orderId, market} = req.body;
    const response = await Redismanger.getInstance().sendAndAwait({
        type: "CANCEL_ORDER",
        data: {
            orderId,
            market
        }
    });
    res.json(response.payload);
})

orderRouter.get("/open", async (req ,res) =>{
    const response = await Redismanger.getInstance().sendAndAwait({
        type: "GET_OPEN_ORDERS",
        data: {
            userId: req.query.userId as string,
            market: req.query.market as string
        }
    })

    res.json(response.payload);
})