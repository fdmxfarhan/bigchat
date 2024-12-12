const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const path = require('path');
var logger = require('morgan');
const PORT = process.env.PORT || 3000;
var cookieParser = require('cookie-parser');
var fs = require('fs');


// HTTPS key and ssl
var privateKey  = fs.readFileSync('ssl/server.key', 'utf8');
var certificate = fs.readFileSync('ssl/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// public path setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) =>{
    var userID = req.query.user;
    console.log(userID);
    res.render('index', {userID})
})




var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

const io = require('socket.io')(httpServer);
const io2 = require('socket.io')(httpsServer);


io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected', userId);
        });

        socket.on('ice-candidate', (candidate, userId) => {
        socket.to(roomId).emit('ice-candidate', candidate, userId);
        });

        socket.on('offer', (offer, userId) => {
        socket.to(roomId).emit('offer', offer, userId);
        });

        socket.on('answer', (answer, userId) => {
        socket.to(roomId).emit('answer', answer, userId);
        });
    });
});
io2.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });

        socket.on('ice-candidate', (candidate, userId) => {
            socket.to(roomId).emit('ice-candidate', candidate, userId);
        });

        socket.on('offer', (offer, userId) => {
            socket.to(roomId).emit('offer', offer, userId);
        });

        socket.on('answer', (answer, userId) => {
            socket.to(roomId).emit('answer', answer, userId);
        });
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
  httpsServer.listen(443);