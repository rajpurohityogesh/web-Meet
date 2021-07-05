import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import TextField from "@material-ui/core/TextField";
import VideoCam from "@material-ui/icons/Videocam";
import VideoCamOff from "@material-ui/icons/VideocamOff";
import Mic from "@material-ui/icons/Mic";
import MicOff from "@material-ui/icons/MicOff";
import {makeStyles} from "@material-ui/core/styles";
import React, {useState,useEffect,useContext} from 'react';
import io from "socket.io-client";
import { Redirect } from 'react-router';
import {UserContext} from "../UserContext";
import MyVideo from "./MyVideo";
import {v4 as uuidv4} from "uuid";

var socket;
var meetingId;

const useStyle = makeStyles({
    heading:{
        margin:"30px 30px 50px",
    },
    gridContain : {
        margin: "10px auto",
    },
    myVideo : {
        transform: "rotateY(180deg)",
        WebkitTransform:"rotateY(180deg)",
        borderRadius:'10px',
        padding:"0px",
    },
    buttonGrp : {
        width: 'fit-content',
        margin: '20px auto',
    },
    hrTag : {
        width :"70%",
        margin : "10px auto",
        color:"#9c9c9c"
    },
})



const Home = () => {

    const {user,setUser} = useContext(UserContext);

    const [stream,setStream] = useState();
    const [meetPresent,setMeetPresent] = useState(false);
    const [videoOn,setVideoOn] = useState(true);
    const [audioOn,setAudioOn] = useState(true);
    const [meetId,setMeetId]=useState("");
    const classes = useStyle();


    useEffect(()=>{
        socket=io("http://localhost:5000");
        console.log("Page Refreshes");
        navigator.mediaDevices.getUserMedia({ video: true, audio: true}).then((stream) => {
            setStream(stream);
        });
    },[]);

    const videoClicked = ()=>{
        setVideoOn(!videoOn);
    }

    const audioClicked = ()=>{
        setAudioOn(!audioOn);
    }

    const createMeet = ()=>{
        meetingId=uuidv4();
        const userData = {
            meetingId : meetingId,
            socketId : socket.id,
            // stream:stream,
            videoOn:videoOn,
            audioOn:audioOn,
            // initiator : true,
        }
        socket.emit("createMeet",userData);
        setUser({
            stream:stream,
            videoOn:videoOn,
            audioOn:audioOn,
            socket:socket,
            initiator:true
        });
        // meetingId=socket.id;
        setMeetPresent(true);
    }

    const joinMeet = ()=>{
        const userData = {
            meetingId : meetId,
            socketId : socket.id,
            // stream : stream,
            videoOn:videoOn,
            audioOn:audioOn,
            // initiator : false
        }
        socket.emit("requestJoin",userData);
        socket.on("response", (data)=>{
            if(data.meetPresent){
                setUser({
                    stream:stream,
                    videoOn:videoOn,
                    audioOn:audioOn,
                    socket:socket,
                    initiator:false
                });
                meetingId=meetId;
                setMeetPresent(true);
                console.log("Meeting Milllll gayiii");
            } else {
                console.log("Meeting nahiiiiiiiiiiiiiiiiiiiiii Milllll gayiii");
                setMeetPresent(false);
            }
        })
    }
    

    //var color = '#'+Math.floor(Math.random()*16777215).toString(16);

    return (
        <div>
            <h1 className={classes.heading}>Welcome to Web Meet App</h1>
            <Grid container className={classes.gridContain}>
                <Grid item xs={2} md={2}></Grid>
                <Grid  item xs={8} md={4}>
                    <MyVideo block={4} stream={stream} videoOn={videoOn} audioOn={audioOn}/>
                    <ButtonGroup className={classes.buttonGrp} variant="contained" aria-label="contained primary button group">
                        <IconButton onClick={videoClicked} aria-label="primary" color={videoOn?"primary":"secondary"}>
                            {videoOn?<VideoCam />:<VideoCamOff />}
                        </IconButton>
                        <IconButton onClick={audioClicked} aria-label="primary" color={audioOn?"primary":"secondary"}>
                            {audioOn?<Mic />:<MicOff/>}
                        </IconButton>
                    </ButtonGroup>
                </Grid>
                <Grid style={{margin:"auto",position:"relative",}} item xs={8} md={4}>
                    <form style={{margin:"30px"}} >
                        <Button variant="contained" color="primary" onClick={createMeet}>
                            Create meeting
                        </Button>
                        {meetPresent ? <Redirect to={"/meeting/"+meetingId} />:null}
                    </form>
                    <p className={classes.hrTag}>--------------------Or--------------------</p>
                    <form style={{margin:"30px"}}>
                        <TextField id="meeting-id" label="Meeting ID" variant="outlined" value={meetId} onChange={(e)=>setMeetId(e.target.value)}/><br/>
                        <Button style={{margin:"15px"}} variant="contained" color="primary" onClick={joinMeet}>
                            Join Meeting
                        </Button>
                    </form>
                </Grid>
                <Grid item xs={2} md={2}></Grid>
            </Grid>
        </div>
    )
}

export default Home
