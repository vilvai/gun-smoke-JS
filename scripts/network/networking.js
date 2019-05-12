
//Host is set if you connect to someone
let host = null
//Connections are other people connected to you
let connections = []
const peer = setup_peer()

//Setup peer and all it's event handlers
function setup_peer(){
    let peer = new Peer({key: 'peerjs', host: 'gunsmok.herokuapp.com', secure: true, port: 443})
    peer.on('error', function(err) {alert("Peer.js " + err)})
    console.log(peer)

    peer.on('connection', function(conn) {
        //Push the new connection to a list
        console.log("New connection: ", conn.connectionId)
        connections.push(conn)
        host = peer.id

        //Handle incoming traffic
        conn.on('data', function(data){
            console.log(data)
        })

        conn.on('close', function() {
            //Remove connection from the list
            console.log(conn.connectionId + " has left")
            connections = connections.filter((current_conn)=>current_conn.connectionId != conn.connectionId)
            if(!connections) host = null
        })
    })
    
    return peer
}



function connect_to_host(host_id){
    if(!host){
        
        console.log("Connecting to host: " + host_id)
        let conn = peer.connect(host_id)
        //On open will be launch when you successfully connect to PeerServer
        conn.on('open', function(){
            console.log("Connection succesful")
            //Send ok to the host
            conn.send('ok')
            host = conn
        })

        conn.on('close', function() {
            host = null
            alert("Host closed connection")
            console.log("Host closed connection")
        })
    }
}


//TODO fuusioi tää saman eventin kanssa joka piirtää viivaa?
//https://stackoverflow.com/questions/7790725/javascript-track-mouse-position
function handleMouseMove(event) {
    if(host && host!=peer.id)
        host.send(
            JSON.stringify(
                {mouse_move:
                    {
                        X:event.pageX,
                        Y:event.pageY
                    }
                }))
}

function handleMouseClick(){
    if(host && host!=peer.id)
        host.send(
            JSON.stringify(
                {mouse_click:
                    {
                        X:event.pageX,
                        Y:event.pageY
                    }
                }))
}

document.getElementById("connect-to-btn").onclick = ()=>{
    connect_to_host(document.getElementById("connect-to-text").value)
}

/* document.addEventListener("keydown", function(event) {
    console.log(event.which)
}) */

document.onmousemove = handleMouseMove
document.onclick = handleMouseClick


//heroku.com/deploy/?template=https://github.com/peers/peerjs-server