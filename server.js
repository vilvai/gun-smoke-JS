// const http = require('http');
// const fs = require('fs');
//
// fs.readFile('./index.html', (err, html) => {
//   if (err) throw err;
//   http
//     .createServer((request, response) => {
//       response.writeHeader(200, { 'Content-Type': 'text/html' });
//       response.write(html);
//       response.end();
//     })
//     .listen(8080);
// });

const connect = require('connect');
const serveStatic = require('serve-static');
connect()
  .use(serveStatic(__dirname))
  .listen(8080, function() {
    console.log('Server running on 8080...');
  });
