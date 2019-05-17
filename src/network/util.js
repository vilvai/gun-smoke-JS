//Host is set if you connect to someone
let host = null;
let isHost = false;
let isClient = false;
//Connections are other people connected to you
let connections = [];
let playerByconnectionId = {};
let peer = null;

//Setup peer and all it's event handlers
export function setup_peer() {
  let peer = new Peer({
    key: 'peerjs',
    host: 'gunsmok.herokuapp.com',
    secure: true,
    port: 443,
  });

  peer.on('error', function(err) {
    alert('Peer.js ' + err);
    isClient = false;
    if (peer._destroyed) {
      reset_vars();
    }
  });
  console.log(peer);

  //Timeout if peer doesn't have id after 10 tries
  let timeout = 10;
  //Setup self as host, but wait till peer gets id
  function set_host() {
    if (timeout)
      setTimeout(function() {
        if (peer.id) host = peer;
        else {
          timeout--;
          set_host();
        }
      }, 500);
    else {
      alert("Can't connect to the server, try again please");
      isHost = false;
    }
  }

  //Set self as host if isHost
  if (isHost) set_host();

  //Peer event handlers, mostly related to host
  peer.on('connection', function(conn) {
    //Push the new connection to a list
    console.log('New connection: ', conn.connectionId);
    connections.push(conn);
    //TODO DO THIS ONLY WHEN CONNECTION IS SUCCESSFULL
    playerByconnectionId[conn.connectionId] = ctx.spawn();

    //Handle incoming traffic
    conn.on('data', function(data) {
      console.log(data);
      //player index
      /*  pi = playerByconnectionId[conn.connectionId]
            player = players[pi]
            m_click = data.mouse_click
            m_move = data.mouse_move
            if(m_click){
            }
            if(m_move){
                player.mouseX = m_move.X
                player.mouseY = m_move.Y
            } */
    });

    conn.on('close', function() {
      disconnect_conn(conn);
    });
    conn.on('disconnect', function() {
      disconnect_conn(conn);
    });
  });

  return peer;
}

function reset_vars() {
  host = null;
  isHost = false;
  isClient = false;
  connections = [];
  playerByconnectionId = {};
  peer.destroy();
  peer = null;
  //conn.close()
}

//What does client do when host disconnects
function disconnect_host(conn) {
  reset_vars();
  alert('Host closed connection');
  console.log('Host closed connection');
}

//Connect to given host if one isn't a host already
function connect_to_host(host_id) {
  //Setup a client
  peer = setup_peer();
  console.log('Connecting to host: ' + host_id);
  let conn = peer.connect(
    host_id,
    (label = 'Player')
  );
  //On open will be launch when you successfully connect to PeerServer
  conn.on('open', function() {
    console.log('Connection succesful');
    //Send ok to the host
    conn.send('ok');
    host = conn;
    //Disconnect the peer so no-one can connect to it
    peer.disconnect();
  });

  conn.on('close', function() {
    disconnect_host(conn);
  });
  conn.on('disconnect', function() {
    disconnect_host(conn);
  });
}

function stop_hosting() {
  if (isHost && host != null) {
    reset_vars();
  }
}

function send_to_clients(data) {
  connections.forEach(conn => {
    conn.send(data);
  });
}

//What does a host do when client disconnects
function disconnect_conn(conn) {
  //Remove connection from the list
  console.log(conn.connectionId + ' has left');
  conn.close();

  conn_keys = Object.keys(playerByconnectionId);
  conn_keys.forEach(current_conn => {
    if (current_conn == conn.connectionId)
      delete playerByconnectionId[current_conn];
  });
  connections = connections.filter(
    current_conn => current_conn.connectionId != conn.connectionId
  );
}

/// UI

//TODO fuusioi tää saman eventin kanssa joka piirtää viivaa?
//https://stackoverflow.com/questions/7790725/javascript-track-mouse-position
function handleMouseMove(event) {
  if (!isHost && host != null)
    host.send({
      mouse_move: {
        X: event.pageX,
        Y: event.pageY,
      },
    });
}

function handleMouseClick() {
  if (!isHost && host != null)
    host.send({
      mouse_click: {
        X: event.pageX,
        Y: event.pageY,
      },
    });
}

document.getElementById('connect-to-btn').onclick = () => {
  if (!isClient && !isHost && host == null) {
    isClient = true;
    connect_to_host(document.getElementById('connect-to-text').value);
  }
};

document.getElementById('host-btn').onclick = () => {
  if (!isHost && !isClient && host == null) {
    isHost = true;
    peer = setup_peer();
    document.getElementById('connect-to-text').value = peer.id;
  }
};

/* document.addEventListener("keydown", function(event) {
    console.log(event.which)
}) */

document.onmousemove = handleMouseMove;
document.onclick = handleMouseClick;

//heroku.com/deploy/?template=https://github.com/peers/peerjs-server
