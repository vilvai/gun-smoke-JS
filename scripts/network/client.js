//What does client do when host disconnects
function disconnect_host(conn){
    reset_vars()
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
        if(!host && isClient)
            disconnect_host(conn)
    })
    conn.on('disconnect', function() {
        if(!host && isClient)
            disconnect_host(conn)
    })
}

