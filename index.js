// 次にアクセスするとBasic認証のダイアログが表示される
// http://localhost:8000/enquetes/yaki-shabu
// http://localhost:8000/logout にアクセスするとログアウトする
'use strict';
const http = require('http');
const pug = require('pug');
// Basic認証をするためのモジュール 他にはCookieを使った認証やOAuthを使った認証がある
const auth = require('http-auth');
const basic = auth.basic(
  // Basic 認証時に保護する領域を規定する文字列
  { realm: 'Enquetes Area.' },
  (username, password, callback) => {
    // このIDとPWがChromeの開発者ツールのNetworkタブのリクエストヘッダから見れる
    // Base64 エンコードされた値だが、JavaScriptでatob('Z3Vlc3Q6eGFYWkpRbUU=')とすれば復元できる
    // つまり暗号化はなされていない
    callback(username === 'guest' && password === 'xaXZJQmE');
  });
  // 第一引数にbasicオブジェクトを渡してBasic認証に対応させてserverのオブジェクトを生成
const server = http.createServer(basic, (req, res) => {
  console.info('Requested by ' + req.socket.remoteAddress);
  // パスが/logoutのときはログアウトしました、と書き出し、
  // ステータスコード 401 - Unauthorized を返す処理
  if (req.url === '/logout') {
    // ステータスコードの仕様は次に記載
    // https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
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
          const qs = require('querystring');
          const answer = qs.parse(rawData);
          const body = answer['name'] + 'さんは' +
            answer['favorite'] + 'に投票しました';
          console.info(body);
          res.write('<!DOCTYPE html><html lang="ja"><body><h1>' +
            body + '</h1></body></html>');
          res.end();
        });
      break;
    default:
      break;
  }
})
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
