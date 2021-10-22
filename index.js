'use strict';
const http = require('http');
const pug = require('pug');
const auth = require('http-auth');
const basic = auth.basic(
  { realm: 'Enquetes Area.' },
  (username, password, callback) => {
    callback(username === 'guest' && password === 'xaXZJQmE');
  });
const server = http.createServer(basic.check((req, res) => {
  console.info('Requested by ' + req.socket.remoteAddress);

  if (req.url === '/logout') {
    res.writeHead(401, {
      'Content-Type': 'text/plain; charset=utf-8'
    });
    res.end('ログアウトしました');
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8'
  });

  switch (req.method) {
    case 'GET':
      if (req.url === '/') {
        res.write('<!DOCTYPE html><html lang="ja"><body>' +
          '<h1>アンケートフォーム</h1>' +
          '<a href="/enquetes">アンケート一覧</a>' +
          '</body></html>');
      } else if (req.url === '/enquetes') {
        res.write('<!DOCTYPE html><html lang="ja"><body>' +
          '<h1>アンケート一覧</h1><ul>' +
          '<li><a href="/enquetes/yaki-shabu">焼き肉・しゃぶしゃぶ</a></li>' +
          '<li><a href="/enquetes/rice-bread">ごはん・パン</a></li>' +
          '<li><a href="/enquetes/sushi-pizza">寿司・ピザ</a></li>' +
          '</ul></body></html>');
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
        res.write(pug.renderFile('./form.pug', {
          path: req.url,
          firstItem: '寿司',
          secondItem: 'ピザ'
        }));
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
          const answer = new URLSearchParams(rawData); // qs は、非推奨になったということなので、他の書き方にしてみる
            let body;
            // アイテムが選択されていなくても投票できてしまうので、選択されているかどうかで表示結果を分岐させる
            if (answer.get('favorite')) { // アイテムが選択されている場合は、"ログイン時のユーザー名を入れて"結果を表示
              body = req.user + 'さんは' +
              answer.get('favorite') + 'に投票しました';
            } else { // 選択されていない場合は、エラーを表示
              body = 'アイテムが選択されていません';
            }
            console.info(body);
            res.write('<!DOCTYPE html><html lang="ja"><body><h1>' +
              body + '</h1></body></html>');
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
  console.info('Listening on ' + port);
});
