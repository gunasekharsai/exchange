
import {Client} from 'pg';
import { createClient } from 'redis';
const pgclient = new Client({
    user:'your_user',
    host:'localhost',
    database:'your_database',
    password:'your_password',
    port:5432
});


pgclient.connect();

async function main(){
    const redisclient = createClient();
    await redisclient.connect();;

    console.log("connected to redis");

    while(true){
        const response = await redisclient.rPop("db_processor" as string);

        if(!response){
            console.log("no respnse sorry");
        }else{
            const data = JSON.parse(response);

            if(data.type === "TRADE_ADDED"){
                console.log("adding data");
                console.log(data);
                const price = data.data.price;
                const timestamp = new Date(data.data.timestamp);
                const query = 'INSERT INTO tata_prices (time, price) VALUES ($1, $2)';
                // TODO: How to add volume?
                const values = [timestamp, price];
                await pgclient.query(query, values);
            }
        }
    }
}

main();

