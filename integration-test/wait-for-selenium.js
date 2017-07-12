var sock = new require('net').Socket();

sock.on('connect', function () {
  sock.end();
});

sock.on('error', function () {
  scheduleConnect();
});

function tryConnect () {
  sock.connect(4444, 'localhost');
}

function scheduleConnect () {
  setTimeout(tryConnect, 500);
}

tryConnect();
