const http = require('http');

const requestListener = function (req, res) {
  res.writeHead(200);
  res.end('server ok');
}

let port = 8080;
const server = http.createServer(requestListener);
server.listen(8080);
console.log("listening on port " + port);