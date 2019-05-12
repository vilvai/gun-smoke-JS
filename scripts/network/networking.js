
let host = null
let connections = []

const peer = new Peer({key: 'peerjs', host: 'gunsmok.herokuapp.com', secure: true, port: 443});
peer.on('error', function(err) {alert("Peer.js " + err)})
console.log(peer)

peer.on('connection', function(conn) {
    conn.on('data', function(data){
        connections.push(conn)
        console.log(data);
        conn.on('close', function() {
            host = null
            console.log(conn.connectionId + " has left")
            connections = connections.filter((current_conn)=>current_conn.connectionId != conn.connectionId)
        })
    });
  });

document.getElementById("connect-to-btn").onclick = ()=>{
    host_id = document.getElementById("connect-to-text").value
    let conn = peer.connect(host_id);
    // on open will be launch when you successfully connect to PeerServer
    conn.on('open', function(){
        // here you have conn.id
        conn.send('ok');
        host = conn

        host.on('close', function() {
            host = null
            alert("Host closed connection")
         })
    });
}

//heroku.com/deploy/?template=https://github.com/peers/peerjs-server