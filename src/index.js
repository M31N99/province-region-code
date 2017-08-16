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
* @param: {url} 目标地址
* */
const getProvice = async function (url) {
    console.log('========getProvice1 start==========');
    const body = await getData(url);
    const $ = cheerio.load(body);
    const lists = $('tr.provincetr a');

    let items = [];
    console.log('========getProvice1 getData succees==========');
    for(let i = 0; i < lists.length; i++){
        console.log(i + 'i' + $(lists[i]).text());
        const $this = $(lists[i]);
        const nextUrl = $this.attr('href');
        const childrens = !nextUrl ? [] :  await getListData(getUrl(url,nextUrl));
        const code = nextUrl.replace(/\D/g,'');
        const value = $this.text();
        console.log('==>getProvice1==>',code,value)
        items.push({ code, value, childrens });
    }
    return items;
};

/*
 * @function: 获取市级数据
 * @param: {url} 目标地址
 * */
const getCity = async function (url) {

    console.log('getCity==>',url);
    const body = await getData(url);
    const $ = cheerio.load(body);
    const lists = $('tr.citytr');
    console.log('getCity2==>','after body');
    let items = [];
    for(let i = 0; i < lists.length; i++){
        const $this = $(lists[i]);
        const $a = $this.find('a');
        const nextUrl = $($a[0]).attr('href');
        const childrens = !nextUrl ? [] : await getCounty(getUrl(url,nextUrl));
        const code = $($a[0]).text();
        const value = $($a[1]).text();
        console.log('==>getCity2==>',code,value)
        items.push({ code, value, childrens });
    }
    console.log('getCity==>','after forloop');
    return items;
};

/*
 * @function: 获取区级及其区级以下数据
 * @param: {url} 目标地址
 * */
const getCounty = async function (url) {
    console.log('getCounty3==>',url);
    const body = await getData(url);
    const $ = cheerio.load(body);
    const lists = $('tr.countytr');

    console.log('getCounty3==>','after body');
    let items = [];
    for(let i = 0; i < lists.length; i++){
        const $this = $(lists[i]);
        const $a = $this.find('a');
        const nextUrl = $($a[0]).attr('href');
        const code = $($a[0]).text();
        const value = $($a[1]).text();
        console.log('==>getCounty3==>',code,value)
        const childrens = !!nextUrl? [] : await getTown(getUrl(url,nextUrl));

        items.push({ code, value, childrens });

    }
    console.log('getCounty==>','after forloop');
    return items;
};

/*
 * @function: 获取区级及其区级以下数据
 * @param: {url} 目标地址
 * */
const getTown = async function (url) {
    console.log('getCounty==>',url);
    const body = await getData(url);
    const $ = cheerio.load(body);
    const lists = $('tr.towntr');

    console.log('getTown==>','after body');
    let items = [];
    for(let i = 0; i < lists.length; i++){
        const $this = $(lists[i]);
        const $a = $this.find('a');
        const nextUrl = $($a[0]).attr('href');
        const code = $($a[0]).text();
        const value = $($a[1]).text();
        const childrens = !nextUrl ? [] : await getVillage(getUrl(url,nextUrl));

        items.push({ code, value, childrens });

    }
    console.log('getCounty==>','after forloop');
    return items;
};

/*
 * @function: 获取区级及其区级以下数据
 * @param: {url} 目标地址
 * */
const getVillage = async function (url) {
    console.log('getVillage==>',url);
    const body = await getData(url);
    const $ = cheerio.load(body);
    const lists = $('tr.villagetr');

    console.log('getCounty==>','after body');
    let items = [];
    for(let i = 0; i < lists.length; i++){
        const $this = $(lists[i]);
        const $td = $this.find('td');
        const code1 = $($td[0]).text();
        const code2 = $($td[1]).text();
        const value = $($td[2]).text();
        items.push({ code1, code2, value });

    }
    console.log('getCounty==>','after forloop');
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
        const childrens = !nextUrl? [] : await getListData(getUrl(url,nextUrl));
        items.push({ code, value, childrens });
    }

    console.log('==end foorloop==>');
    return items;
};

/*
* @function: 提取一个获取数据的方法
* @param: {url} 目标地址
* */
const getData = function (url) {
    if(!url) return [];
    return new Promise(function (resolve,reject) {
        console.log('enter PROMISE============')
        request({ url, encoding: null }, function (error, response, body) {
            console.log('body',body)
            if (!error && response.statusCode === 200) {
                console.log('========request success==========');
                //gbk 或者 gb2312 都可以
                resolve(iconv.decode(body, 'gb2312').toString());
            }else {
                reject(error);
                console.log('========request fail==========');
            }
        });
    })
};

/*
* @function: 拼接url
* @params: {oldUrl} 上一次的url; {newUrl} 新的url尾
* */
const getUrl = function (oldUrl, newUrl) {
    if(!oldUrl) return target + '/2016/index.html';
    if(!newUrl) return oldUrl;
    const res = oldUrl.split('/');
    res.splice(-1,1,newUrl);
    console.log(oldUrl,'==>',res.join('/'));
    return res.join('/');

}

module.exports = getProvice(getUrl());
