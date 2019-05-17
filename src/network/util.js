import { spawnPlayer, spawnOtherPlayer } from '../app.js';

//Host is set if you connect to someone
let host = null;
let isHost = false;
let isClient = false;
//Connections are other people connected to you
let connections = [];
let playersByconnectionId = {};
let peer = null;

//Setup peer and all it's event handlers
export const setupPeer = new Promise((resolve, reject) => {
  const peer = new Peer({
    host: 'gunsmok.herokuapp.com',
    secure: true,
    port: 443,
  });
  peer.on('open', resolve);
  peer.on('error', reject);

  //Peer event handlers, mostly related to host
  peer.on('connection', function(conn) {
    //Push the new connection to a list
    console.log('New connection: ', conn.connectionId);
    spawnOtherPlayer();
    connections.push(conn);
    //TODO DO THIS ONLY WHEN CONNECTION IS SUCCESSFULL
    playersByconnectionId[conn.connectionId] = ctx.spawn();

    //Handle incoming traffic
    conn.on('data', function(data) {
      console.log(data);
    });

    conn.on('close', function() {
      disconnectConnection(conn);
    });
  });

  return peer;
});

function resetVars() {
  host = null;
  isHost = false;
  isClient = false;
  connections = [];
  playersByconnectionId = {};
  peer.destroy();
  peer = null;
  //conn.close()
}

//What does client do when host disconnects
function disconnectHost(conn) {
  resetVars();
  alert('Host closed connection');
  console.log('Host closed connection');
}

//Connect to given host if one isn't a host already
export function connectToHost(hostId) {
  //Setup a client
  peer = setupPeer();
  console.log('Connecting to host: ' + hostId);
  let conn = peer.connect(
    hostId,
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
    disconnectHost(conn);
  });
  conn.on('disconnect', function() {
    disconnectHost(conn);
  });
}

function stopHosting() {
  if (isHost && host != null) {
    resetVars();
  }
}

export function sendToClients(data) {
  connections.forEach(conn => {
    conn.send(data);
  });
}

//What does a host do when client disconnects
function disconnectConnection(connection) {
  //Remove connection from the list
  console.log(connection.connectionId + ' has left');
  connection.close();

  connectionKeys = Object.keys(playersByconnectionId);
  connectionKeys.forEach(currentConnection => {
    if (currentConnection == connection.connectionId)
      delete playersByconnectionId[currentConnection];
  });
  connections = connections.filter(
    currentConnection =>
      currentConnection.connectionId != connection.connectionId
  );
}

//heroku.com/deploy/?template=https://github.com/peers/peerjs-server
