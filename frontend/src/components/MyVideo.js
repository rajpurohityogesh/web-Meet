import UserTag from "@material-ui/icons/Person";
import React,{useState,useRef,useEffect} from 'react';

const MyVideo = ({block,stream,videoOn,audioOn,userName}) => {

    const videoStyle={
        transform: "rotateY(180deg)",
        WebkitTransform:"rotateY(180deg)",
        borderRadius:'10px'
    }

    const [width,setWidth] = useState(parseInt((window.innerWidth/12)*block));
    const [height,setHeight] = useState(parseInt((width*3)/4));
    const myStream = useRef();

    useEffect(() => {
        if(videoOn || audioOn){
            if("srcObject" in myStream.current){
                myStream.current.srcObject = stream;
            }
            else {
                myStream.current.src = window.URL.createObjectURL(stream);
            }
        }
    }, [stream,videoOn,audioOn]);

    window.onresize = () => {
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

export default MyVideo
