io.socket.on('message', function (data) {
    alert(data.data);
    setTimeout(function () {
        window.location.href = 'overview';
    }, 5000);
});

io.socket.post('/socket/rejoin', {}, function (body, JWR) {
    if (body.data == 'redirect') {
        window.location.href = 'overview';
    }
});