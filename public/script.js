const socket = io('/');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
});
var userId = document.getElementById('user-id').textContent;
console.log(userId)
var codeGen = (length) =>{
  var result           = '';
  var characters       = '123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
.then(stream => {
  localVideo.srcObject = stream;
  stream.getTracks().forEach(track => {
    peerConnection.addTrack(track, stream);
  });
  socket.emit('join-room', 'room1', userId);
});

socket.on('user-connected', userId => {
  peerConnection.createOffer((offer) => {
    peerConnection.setLocalDescription(new RTCSessionDescription(offer), () => {
      socket.emit('offer', offer, userId);
    });
  });
});

socket.on('offer', async (offer, userId) => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
  socket.emit('answer', answer, userId);
});

socket.on('answer', async (answer, userId) => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('ice-candidate', (candidate, userId) => {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

peerConnection.addEventListener('icecandidate', event => {
  if (event.candidate) {
    socket.emit('ice-candidate', event.candidate, USER_ID);
  }
});

peerConnection.addEventListener('track', event => {
  remoteVideo.srcObject = event.streams[0];
});