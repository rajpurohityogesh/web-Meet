import Grid from '@material-ui/core/Grid';
import Container from "@material-ui/core/Container";
import IconButton from '@material-ui/core/IconButton';
import Button from "@material-ui/core/Button";
import ButtonGroup from '@material-ui/core/ButtonGroup';
import VideoCam from "@material-ui/icons/Videocam";
import VideoCamOff from "@material-ui/icons/VideocamOff";
import Mic from "@material-ui/icons/Mic";
import MicOff from "@material-ui/icons/MicOff";
import CallEnd from "@material-ui/icons/CallEndRounded";
import UserTag from "@material-ui/icons/Person";
import {makeStyles} from "@material-ui/core/styles";
import MyVideo from "./MyVideo";
import UserVideo from "./UserVideo";
import React,{useState, useContext,useEffect,useRef} from 'react';
import Peer from "simple-peer";
import {UserContext} from "../UserContext";

let temp = window.innerWidth/2-154;

const TryVideo = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    });

    return (
        <video playsInline autoPlay ref={ref} />
    );
}


const videoStyle={
    transform: "rotateY(180deg)",
    WebkitTransform:"rotateY(180deg)",
    borderRadius:'10px'
}

const useStyle = makeStyles({
    allStream : {
        width:"fit-content",
        position:"relative",
        margin : "auto"
    },
    controls :{
        position:"fixed",
        width:"fit-content",
        padding:"40px",
        bottom:"0",
        left:temp,
        right:temp,
    }
})


const Meeting = () => {

    const {user,setUser} = useContext(UserContext);
    const [stream,setStream] = useState(user.stream);
    const [videoOn,setVideoOn] = useState(user.videoOn);
    const [audioOn,setAudioOn] = useState(user.audioOn);
    const [block,setBlock] = useState(3);
    const [peers,setPeers] = useState([]);
    const peersRef = useRef([]);
    const classes = useStyle();
    const [temp,setTemp] = useState(false);

    useEffect(() => {
        console.log("Meet data has been changed ");
        console.log(peers)
    }, [peers])
    
    useEffect(() => {
        user.socket.on("alreadyInMeet",(users)=>{
            const peers = [];
            users.forEach(userID => {
                const peer = createPeer(userID, user.socket.id, stream);
                peersRef.current.push({
                    peerID: userID,
                    peer,
                })
                peers.push(peer);
            })
            setPeers(peers);
            // console.log("Object Keys we get from server in userData "+Object.keys(usersData));
            // users.forEach(userId => {
            //     // var socketId = usersData[userId].socketId;
            //     const peer = createPeer(userId, user.socket.id, stream);
            //     peersRef.current.push({
            //         peerID: userId,
            //         peer,
            //     })
            //     peers.push(peer);
            //     // peers.push({
            //     //     peer,
            //     //     userId: userId,
            //     //     ...usersData[userId]
            //     // });
            // })
        });
            
        user.socket.on("user joined", payload => {
            console.log("Got new user joined event from "+payload.callerID);
            const peer = addPeer(payload.signal, payload.callerID, stream);
            peersRef.current.push({
                peerID: payload.callerID,
                peer,
            })

            setPeers(users => [...users, peer]);
            // var userPresent = meetData.find(p => p.userId===payload.callerID);
            // console.log("This is user Present Data "+userPresent);
            // if(userPresent){
            //     console.log("Vapas se "+payload.callerID+" Ko add kar raha hai ");
            // }else {
                // setMeetData(users => [...users, {peer, userId:"payload.callerID", videoOn:payload.videoOn, audioOn:payload.audioOn}]);
            // }
        });

        user.socket.on("receiving returned signal", payload => {
            console.log("Getting receiving returned signal event");
            const item = peersRef.current.find(p => p.peerID === payload.id);
            // if(!item) {
            //     const peer = addPeer(payload.signal, payload.callerID, stream);
            //     peersRef.current.push({
            //         peerID: payload.callerID,
            //         peer,
            //     })
            //     setPeers(users => [...users, peer]);
            // }
            // else {
            // if(temp){
            //     console.log("Got signal from "+payload.id+" to "+user.socket.id+" Againnnnnnnn");
            // }else {
            //     console.log("Got signal from "+payload.id+" to "+user.socket.id);
            item.peer.signal(payload.signal);
            //     await setTemp(true);
            // }   
            // }
        });
    });

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        console.log("Creating Peer Connection with "+callerID+" from "+user.socket.id);

        peer.on("signal", signal => {
            console.log("Sending signal on peer from "+callerID+" to "+userToSignal);
            user.socket.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        console.log("Get signal from "+callerID+" to "+user.socket.id);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            console.log("Returing signal to "+callerID+" from "+user.socket.id);
            user.socket.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }


    const videoClicked =()=>{
        setVideoOn(!videoOn);
    }

    const audioClicked =()=>{        
        setAudioOn(!audioOn);

    }

    return (
        <div>
            <Grid className={classes.allStream} container spacing={5}>
                <Grid item >
                    <MyVideo block={block} stream={stream} videoOn={videoOn} audioOn={audioOn} userName={user.socket.id}/>      
                </Grid>
                {peers.map((peer, index) => {
                    return (
                        <TryVideo key={index} peer={peer} />
                    );
                })}
                
            </Grid>
            <Container className={classes.controls}>
                <ButtonGroup variant="contained" aria-label="contained primary button group">
                    <IconButton style={{backgroundColor:"#fff"}} onClick={videoClicked} aria-label="primary" color={videoOn?"primary":"secondary"}>
                        {videoOn?<VideoCam />:<VideoCamOff />}
                    </IconButton>
                    <IconButton style={{backgroundColor:"#fff"}} onClick={audioClicked} aria-label="primary" color={audioOn?"primary":"secondary"}>
                        {audioOn?<Mic />:<MicOff />}
                    </IconButton>
                    <Button  aria-label="primary" color="secondary">
                        <CallEnd style={{borderRadius:"50%"}}/>
                    </Button>
                </ButtonGroup>
            </Container>
        </div>
    )
}

export default Meeting

// return (
//     <Grid item key={userData.userId} >
//         <UserVideo block={block} videoOn={userData.videoOn} audioOn={userData.audioOn} peer={userData.peer} userName={userData.userId} />
//     </Grid>
// );