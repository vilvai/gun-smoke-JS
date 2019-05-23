import Peer from 'peerjs';

import { startGame, endGame, playerIsHost, onReceiveData } from '../game.js';

export const setupPeer = new Promise((resolve, reject) => {
  const peer = new Peer({
    host: 'gunsmok.herokuapp.com',
    secure: true,
    port: 443,
  });
  peer.on('open', () => resolve(peer));
  peer.on('error', reject);
  peer.on('connection', connection => {
    if (playerIsHost) startGame(connection);
    connection.on('data', onReceiveData);
    connection.on('close', endGame);
  });
});

export const connectToHost = (peer, hostId) =>
  new Promise((resolve, reject) => {
    const connection = peer.connect(hostId);
    connection.on('open', function() {
      peer.disconnect();
      startGame(connection);
    });
    connection.on('data', onReceiveData);
    connection.on('close', endGame);
    connection.on('disconnect', endGame);
  });

//heroku.com/deploy/?template=https://github.com/peers/peerjs-server
