'use strict';
const http = require('http');
const pug = require('pug');
const authz = require('http-auth');
const basic = authz.basic(
  { realm: 'Anquetes Area.' },
  function (username, password, callback) {
    callback(username === 'guest' && password === 'xaXZJQmE');
  })
const server = http
  .createServer(basic.check((req, res) => {
    console.info(' Requested by ' + req.socket.remoteAddress);
    if (req.url === '/logout') {
      res.writeHead(401, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      res.end(pug.renderFile('./logout-page.pug'));
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });

    switch (req.method) {
      case 'GET':
        if (req.url === '/') {
          res.write(
            pug.renderFile('./top-page.pug')
          );
        } else if (req.url === '/enquetes') {
          res.write(
            pug.renderFile('./index-page.pug')
          );
        } else if (req.url === '/enquetes/yaki-shabu') {
          res.write(
            pug.renderFile('./form.pug', {
              path: req.url,
              firstItem: '焼き肉',
              secondItem: 'しゃぶしゃぶ'
            })
          );
        } else if (req.url === '/enquetes/rice-bread') {
          res.write(
            pug.renderFile('./form.pug', {
              path: req.url,
              firstItem: 'ごはん',
              secondItem: 'パン'
            })
          );
        } else if (req.url === '/enquetes/sushi-pizza') {
          res.write(
            pug.renderFile('./form.pug', {
              path: req.url,
              firstItem: '寿司',
              secondItem: 'ピザ'
            })
          );
        }
        res.end();
        break;
      case 'POST':
        let rawData = '';
        req
          .on('data', chunk => {
            rawData = rawData + chunk;
          })
          .on('end', () => {
            const answer = new URLSearchParams(rawData);
            const body = answer.get('name') + 'さんは' +
              answer.get('favorite') + 'に投票しました';
            console.info(body);
            res.write(
              pug.renderFile('./answer.pug', {
                body: body
              })
            );
            res.end();
          });
        break;
      default:
        break;
    }
  }))
  .on('error', e => {
    console.error('Server Error', e);
  })
  .on('clientError', e => {
    console.error('Client Error', e);
  });
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.info('[' + new Date() + '] Listening on ' + port);
});