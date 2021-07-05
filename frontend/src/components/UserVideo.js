import UserTag from "@material-ui/icons/Person";
import React,{useState,useRef,useEffect} from 'react';

const UserVideo = ({block,videoOn,audioOn,peer,userName}) => {

    const videoStyle={
        transform: "rotateY(180deg)",
        WebkitTransform:"rotateY(180deg)",
        borderRadius:'10px'
    }
    
    const [width,setWidth] = useState(parseInt((window.innerWidth/12)*block));
    const [height,setHeight] = useState(parseInt((width*3)/4));
    const myStream = useRef();

    useEffect(() => {
        peer.on("stream", stream => {
            console.log("Got stream from other user");
            if(videoOn || audioOn){
                myStream.current.srcObject = stream;
            }
        })
    });

    window.onresize = async () => {
        setWidth(parseInt((window.innerWidth/12)*block));
        setHeight(parseInt((width*3)/4));
    }

    return (
        <div>
            { videoOn ? <video style={videoStyle} width={width} height={height} playsInline muted={!audioOn} ref={myStream} autoPlay />
                    : <div style={{margin:"0px",padding:"0px"}}>
                          <UserTag style={{margin:"0px",padding:"0px",height:height, width:width,color:""}} />
                            {audioOn ? <audio ref={myStream} autoPlay/> :null}
                      </div>
            }
            <h5>{userName}</h5>
        </div>
    )
}

export default UserVideo
