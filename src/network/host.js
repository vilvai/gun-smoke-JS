function stop_hosting(){
    if(isHost &&
        host != null){
            reset_vars()
        }
}


function send_to_clients(data){
    connections.forEach(conn=>{
        conn.send(data)
    })
}

//What does a host do when client disconnects
function disconnect_conn(conn){
    //Remove connection from the list
    console.log(conn.connectionId + " has left")
    conn.close()

    conn_keys = Object.keys(playerByconnectionId)
    conn_keys.forEach(current_conn => {
        if(current_conn == conn.connectionId) delete playerByconnectionId[current_conn]
    });
    connections = connections.filter((current_conn)=>current_conn.connectionId != conn.connectionId)
}
