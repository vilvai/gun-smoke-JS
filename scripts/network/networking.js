
//Host is set if you connect to someone
let host = null
//Connections are other people connected to you
let connections = []
const peer = setup_peer()

//Setup peer and all it's event handlers
function setup_peer(){
    let peer = new Peer({key: 'peerjs', host: 'gunsmok.herokuapp.com', secure: true, port: 443});
    peer.on('error', function(err) {alert("Peer.js " + err)})
    console.log(peer)

    peer.on('connection', function(conn) {
        //Push the new connection to a list
        conn.on('data', function(data){
            if(data)
            console.log("New connection: ", conn.connectionId)
            connections.push(conn)
            console.log(data);
        });

        conn.on('close', function() {
            //Remove connection from the list
            console.log(conn.connectionId + " has left")
            connections = connections.filter((current_conn)=>current_conn.connectionId != conn.connectionId)
        })
    });
    
    return peer
}



function connect_to_host(host_id){
    console.log("Connecting to host: " + host_id)

    let conn = peer.connect(host_id);
    //On open will be launch when you successfully connect to PeerServer
    conn.on('open', function(){
        console.log("Connection succesful")
        //Send ok to the host
        conn.send('ok');
        host = conn
    });

    conn.on('close', function() {
        host = null
        alert("Host closed connection")
        console.log("Host closed connection")
    })
}

document.getElementById("connect-to-btn").onclick = ()=>{
    connect_to_host(document.getElementById("connect-to-text").value)
}

//heroku.com/deploy/?template=https://github.com/peers/peerjs-server