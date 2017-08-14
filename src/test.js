/**
 * Created by 2ue on 2017/8/14.
 */

const path = require('path');

const http = require('http');
const request = require('request');
const iconv = require('iconv-lite');
const bufferhelper = require('bufferhelper');
const cheerio = require('cheerio');

const config = require('../config');
const target = config.target.host;

/*
 * @function: 获取省份数据
 * */
async function getProvice() {
    const body = await getData(zipUrl([2016, 'index']));
    const $ = cheerio.load(body);
    const lists = $('tr.provincetr a');

    let items = [];
    for(let i = 0; i < lists.length; i++){
        console.log(i + 'i' + $(lists[i]).text());
        const $this = $(lists[i]);
        const url = $this.attr('href');
        const childrens = [];
        const code = url.replace(/\D/g,'');
        const value = $this.text();
        items.push({ code, value, childrens });
    }
    return items;
};


/*
 * @function: 提取一个获取数据的方法
 * */
function getData(url) {
    if(!url) return [];
    return new Promise(function (resolve,reject) {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(body)
            }
        })
        http.get(url, function(res){
            const buffer = new bufferhelper();
            res.on('data', function (chunk) {
                console.log('=============data-data-data=========');
                console.log(chunk);
                buffer.concat(chunk);
            });
            res.on('end',function(){
                console.log('=============end-end-end=========');
                resolve(iconv.decode(buffer.toBuffer(),'GBK'));
            });
        });
    })
};
/*
 * @function: 拼接url
 * @params: para 需要拼接的url数组
 * */

function zipUrl (para,type) {
    let res = target;
    if(!para) return res + '.html';
    if(Object.prototype.toString.call(para) !== '[object Array]') return res + '/' + para + (!type ? '.html' : '');
    for(let i in para){
        res += ('/' + para[i]);
    };
    return res + (!type ? '.html' : '');
}

module.exports = getProvice();
