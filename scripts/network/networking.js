
//Host is set if you connect to someone
let host = null
let isHost = false
let isClient = false
//Connections are other people connected to you
let connections = []
let peer = null

//Setup peer and all it's event handlers
function setup_peer(){
    let peer = new Peer({key: 'peerjs', host: 'gunsmok.herokuapp.com', secure: true, port: 443});
    peer.on('error', function(err) {
        alert("Peer.js " + err)
        isClient = false
        if(peer._destroyed){
            isHost = false
            host = null
            connections = []
        }
    })
    console.log(peer)

    //Timeout if peer doesn't have id after 10 tries
    let timeout = 10
    //Setup self as host, but wait till peer gets id
    function set_host() {
        if (timeout)
            setTimeout(function(){
                if(peer.id)
                    host = peer.id
                else{
                    timeout--
                    set_host()
                }
            }, 500);
        else
            alert("Can't connect to the server, try again please")
    }

    //Set self as host if isHost
    if(isHost)
        set_host()

    //Peer event handlers, mostly related to host
    peer.on('connection', function(conn) {
        //Push the new connection to a list
        console.log("New connection: ", conn.connectionId)
        connections.push(conn)

        //Handle incoming traffic
        conn.on('data', function(data){
            console.log(data);
        });

        conn.on('close', function() {
            disconnect_conn(conn)
        })
        conn.on('disconnect', function() {
            disconnect_conn(conn)
        })
    })

    
    return peer
}

//What does a host do when client disconnects
function disconnect_conn(conn){
    //Remove connection from the list
    console.log(conn.connectionId + " has left")
    conn.close()
    connections = connections.filter((current_conn)=>current_conn.connectionId != conn.connectionId)
}

//What does client do when host disconnects
function disconnect_host(conn){
    host = null
    isClient = false
    //Close host connection and destroy the client peer
    conn.close()
    peer.destroy()
    alert("Host closed connection")
    console.log("Host closed connection")
}


//Connect to given host if one isn't a host already
function connect_to_host(host_id){
    //Setup a client
    peer = setup_peer()        
    console.log("Connecting to host: " + host_id)
    let conn = peer.connect(host_id,label="Player")
    //On open will be launch when you successfully connect to PeerServer
    conn.on('open', function(){
        console.log("Connection succesful")
        //Send ok to the host
        conn.send('ok')
        host = conn
        //Disconnect the peer so no-one can connect to it
        peer.disconnect()
    })

    conn.on('close', function() {
        disconnect_host(conn)
    })
    conn.on('disconnect', function() {
        disconnect_host(conn)
    })
}


//TODO fuusioi tää saman eventin kanssa joka piirtää viivaa?
//https://stackoverflow.com/questions/7790725/javascript-track-mouse-position
function handleMouseMove(event) {
    if(!isHost&&
        host != null)
        host.send(                
                {mouse_move:
                    {
                        X:event.pageX,
                        Y:event.pageY
                    }
                })
}

function handleMouseClick(){
    if(!isHost &&
        host != null)
        host.send(
                {mouse_click:
                    {
                        X:event.pageX,
                        Y:event.pageY
                    }
                })
}

document.getElementById("connect-to-btn").onclick = ()=>{
    if(!isClient && !isHost && host==null){
        isClient = true
        connect_to_host(document.getElementById("connect-to-text").value)
    }
}

document.getElementById("host-btn").onclick = ()=>{
    if(!isHost && !isClient && host==null){
        isHost = true
        peer = setup_peer()
        document.getElementById("connect-to-text").value = peer.id
    }
}

/* document.addEventListener("keydown", function(event) {
    console.log(event.which)
}) */

document.onmousemove = handleMouseMove
document.onclick = handleMouseClick


//heroku.com/deploy/?template=https://github.com/peers/peerjs-server