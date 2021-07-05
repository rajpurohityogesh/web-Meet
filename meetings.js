const mongoose = require("mongoose");


const meetingSchema = new mongoose.Schema({
    meetingId : {
        type : String,
        required : true
    },
    initiator : {
        type : String,
        required : true
    },
    members :{
        type : [String]
    }
},{timestamps : true});


const Meeting = mongoose.model("Meetings",meetingSchema);

module.exports = Meeting;