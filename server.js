/**
 * Created by 2ue on 2017/8/14.
 */

const express = require('express');
const opn = require('opn');

const config = require('./config');
const spider = require('./src/test');

const app = new express();
const url = config.host + ':' + config.port;

//定义路由
app.get('/', function(request, response) {
    spider.then(function (res) {
        response.json({
            cat: res
        });
    })
});

//监听端口
app.listen(config.port, function() {
    console.log('listening at ' + config.port + ': ' + url);
    opn(url);
});