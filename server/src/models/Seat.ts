import mongoose from 'mongoose'
const seatSchema=new mongoose.Schema({
    seatNumber:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        enum:['AVAILABLE','HOLD','BOOKED'],
        default:"AVAILABLE"
    }
});
export default mongoose.model('Seat',seatSchema);