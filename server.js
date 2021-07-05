const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const MeetingModel =require("./meetings")
const app = express();
const server = http.createServer(app);
require("dotenv").config();
const io = socketIo(server,{
    cors :{
            origin: ["http://localhost:3000","http://localhost:3000/meeting/:id"],
            optionSuccessStatus: 200,
        }
});

const MongoDB ="mongodb+srv://yogesh"+process.env.MONGODBPASS+":@cluster0.4ima9.mongodb.net/web-meet?retryWrites=true&w=majority";

app.use(express.json());

// mongoose
//   .connect(MongoDB, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true,
//   })
//   .then(() => console.log("Connected to Database"))
//   .catch((err) => console.log(err));


var meetingId;
var meetingData={};
var userData;

io.on("connection",(socket)=>{
    console.log('New connection made with sockt id '+socket.id);
    
    socket.on("createMeet",(data)=>{
        meetingId= data.meetingId;
        console.log("New Meeting created with data :",meetingId);
        meetingData[data.meetingId] = [socket.id];
        // meetingData[data.meetingId]["UserId"+1] = {
        //     socketId: data.socketId,
        //     videoOn : data.videoOn,
        //     audioOn : data.audioOn,
        // }
        console.log(meetingData)
        // socket.join(meetingId);
    });

    socket.on("requestJoin",(data)=>{
        if(meetingData[data.meetingId]){
            socket.emit("response",{meetPresent : true});
            socket.emit("alreadyInMeet",meetingData[data.meetingId]);
            meetingData[data.meetingId].push(socket.id);
            // var temp = Object.keys(meetingData[data.meetingId]).length+1;
            // meetingData[data.meetingId]["UserId"+temp] = {
            //     socketId: data.socketId,
            //     videoOn : data.videoOn,
            //     audioOn : data.audioOn,
            // }        
            console.log(meetingData)
        }
        else {
            socket.emit("response",{meetPresent : false});
        }
    })
    
    socket.on("sending signal", payload => {
        console.log("Got dignal from "+payload.callerID+" sending user joined event and signel to "+payload.userToSignal);
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID});
    });
    // , videoOn:payload.videoOn, audioOn:payload.audioOn
    socket.on("returning signal", payload => {
        console.log("Returning recieverd signal from "+socket.id+" to "+payload.callerID)
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit("callEnded");
    });
});


server.listen(5000,()=>{
    console.log("Server is running on port ",5000);
});
