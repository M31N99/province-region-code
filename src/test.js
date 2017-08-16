/**
 * Created by 2ue on 2017/8/14.
 */

const path = require('path');

const http = require('http');
const bufferhelper = require('bufferhelper');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');

const config = require('../config');
const target = config.target.host;
let index = 0;

/*
 * @function: 获取省份数据
 * @param: {url} 目标地址
 * */
async function getProvice(url) {
    const body = await getData(url);
    const $ = cheerio.load(body);
    const lists = $('tr.provincetr a');

    let items = [];
    for(let i = 0; i < lists.length; i++){
        console.log(i + 'i' + $(lists[i]).text());
        const $this = $(lists[i]);
        const nextUrl = $this.attr('href');
        const childrens = !url ? [] : await getListData(getUrl(url,nextUrl));
        const code = url.replace(/\D/g,'');
        const value = $this.text();
        items.push({ code, value, childrens });
    }
    return items;
};

/*
 * @function: 获取省级以下数据
 * @param: {url} 目标地址
 * */
const getListData = async function (url) {
    console.log('==entenr==>');
    const body = await getData(url);
    console.log('000000000')
    const $ = cheerio.load(body);
    console.log('1111111111111');
    const lists = $('table[class] tbody tr').slice(1);
    console.log('222222222222');
    let items = [];
    for(let i = 0; i < lists.length; i++){

        console.log('==entenr foorloop==>');
        const $this = $(lists[i]);
        const $a = $this.find('a');
        const $target = $a.length == 0 ? $this.find('td') : $a;
        const nextUrl = $a.length == 0 ? '' : $($a[0]).attr('href');
        const code = $($target[0]).text();
        const value = $($target[1]).text();
        console.log('==>==>',code,value);
        const childrens = (!nextUrl || index > 2) ? [] : await getListData(getUrl(url,nextUrl));
        // const childrens = [];
        items.push({ code, value, childrens });
    }

    index++;
    console.log('==end foorloop==>');
    return items;
};

/*
 * @function: 提取一个获取数据的方法
 * @param: {url} 目标地址
 * */
const getData = function getData(url) {
    if(!url) return [];
    return new Promise(function (resolve,reject) {
        http.get(url, function(res){
            const buffer = new bufferhelper();
            res.on('data', function (chunk) {
                console.log('=============data-data-data=========');
                // console.log(chunk);
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
 * @params: {para} 需要拼接的url数组
 * */

const zipUrl = function  (para,type) {
    let res = target;
    if(!para) return res + '.html';
    if(Object.prototype.toString.call(para) !== '[object Array]') return res + '/' + para + (!type ? '.html' : '');
    for(let i in para){
        res += ('/' + para[i]);
    };
    return res + (!type ? '.html' : '');
}

const getUrl = function (oldUrl, newUrl) {
    if(!oldUrl) return target + '/2016/index.html';
    if(!newUrl) return oldUrl;
    const res = oldUrl.split('/');
    res.splice(-1,1,newUrl);
    console.log(oldUrl,'==>',res.join('/'));
    return res.join('/');

}

module.exports = getProvice(getUrl());
