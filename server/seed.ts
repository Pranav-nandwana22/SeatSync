import mongoose from "mongoose";
import dotenv from 'dotenv';
import Seat from './src/models/Seat';
dotenv.config();
const seedDatabase=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("Connected to database.Preparing to seed data..");
        await Seat.deleteMany({});
        console.log("Cleaned old seats");
        const seatArray=[];
        const rows=['A','B','C','D','E','F','G','H','I','J','k','L','M','N','O','P'];
        for(let i=0;i<rows.length;i++){
            for(let j=1;j<=10;j++){
                seatArray.push({
                    seatNumber:`${rows[i]}${j}`
                });
            }
        }
        await Seat.insertMany(seatArray);
        console.log("160 seats successfully created!");
        process.exit(0);
    }catch(error){
        console.log("Error seeding data:",error);
        process.exit(1);
    }
};
seedDatabase();