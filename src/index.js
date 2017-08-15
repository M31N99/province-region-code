/**
 * Created by 2ue on 2017/8/14.
 */

const path = require('path');

const request = require('request');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const config = require('../config');

const target = config.target.host;

/*
* @function: 获取省份数据
* @param: url 目标地址
* */
async function getProvice(url) {
    console.log('========getProvice start==========');
    const body = await getData(url);
    const $ = cheerio.load(body);
    const lists = $('tr.provincetr a');

    let items = [];
    console.log('========getProvice getData succees==========');
    for(let i = 0; i < lists.length; i++){
        console.log(i + 'i' + $(lists[i]).text());
        const $this = $(lists[i]);
        const nextUrl = $this.attr('href');
        // const childrens = await getCity(zipUrl([2016, nextUrl],true));
        const childrens = [];
        const code = nextUrl.replace(/\D/g,'');
        const value = $this.text();
        items.push({ code, value, childrens });
    }
    return items;
}

/*
 * @function: 获取市级数据
 * @param: url 目标地址
 * */
async function getCity(url) {

    console.log('getCity==>',url);
    const body = await getData(url);
    const $ = cheerio.load(body);
    const lists = $('tr.citytr');
    console.log('getCity==>','after body');
    let items = [];
    for(let i = 0; i < lists.length; i++){
        const $this = $(lists[i]);
        const $a = $this.find('a');
        const nextUrl = $($a[0]).attr('href');
        const childrens = await getCounty(zipUrl([2016, nextUrl],true));
        // const childrens = [];
        const code = $($a[0]).text();
        const value = $($a[1]).text();
        items.push({ code, value, childrens });
    }
    console.log('getCity==>','after forloop');
    return items;
}

/*
 * @function: 获取区级及其区级以下数据
 * @param: url 目标地址
 * */

async function getCounty(url) {
    console.log('getCounty==>',url);
    const body = await getData(url);
    const $ = cheerio.load(body);
    const lists = $('tr.countytr');

    console.log('getCounty==>','after body');
    let items = [];
    for(let i = 0; i < lists.length; i++){
        const $this = $(lists[i]);
        const $a = $this.find('a');
        const nextUrl = $($a[0]).attr('href');
        const code = $($a[0]).text();
        const value = $($a[1]).text();

        if(typeof nextUrl === 'undefined'){
            const childrens = await getData(nextUrl);
            items.push({ code, value, childrens });
        }else {
            items.push({ code, value });
        }

    }
    console.log('getCounty==>','after forloop');
    return items;
}

/*
* @function: 提取一个获取数据的方法
 * @param: url 目标地址
* */
function getData(url) {
    if(!url) return [];
    return new Promise(function (resolve,reject) {
        request({ url, encoding: null }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log('========request success==========');
                //gbk 或者 gb2312 都可以
                resolve(iconv.decode(body, 'gb2312').toString());
            }else {
                console.log('========request fail==========');
            }

        });
    })
}

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

module.exports = getProvice(zipUrl([2016, 'index']));
