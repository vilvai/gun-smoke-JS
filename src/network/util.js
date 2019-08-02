import Peer from 'peerjs';

export const setupPeer = onReceiveData =>
  new Promise((resolve, reject) => {
    const peer = new Peer({
      host: 'gunsmok.herokuapp.com',
      secure: true,
      port: 443,
    });
    peer.on('open', () => resolve(peer));
    peer.on('error', reject);
  });

export const connectToHost = (peer, hostId, onReceiveData, onDisconnect) =>
  new Promise((resolve, reject) => {
    const connection = peer.connect(hostId);
    connection.on('open', function() {
      peer.disconnect();
      resolve(connection);
    });
    connection.on('data', onReceiveData);
    connection.on('close', onDisconnect);
    connection.on('disconnect', onDisconnect);
  });

//heroku.com/deploy/?template=https://github.com/peers/peerjs-server
