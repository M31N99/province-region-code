/**
 * Created by 2ue on 2017/8/14.
 */

const fs = require('fs');
const path = require('path');

const spider = require('../src/');

spider.then(function (res) {
    const text = !res ? '' : res.toString();
    fs.writeFileSync(path.join(__dirname, '../dist/test.json'), text, 'utf-8', function (err, suc) {
        if (err) throw  err;
        console.log('success!');
    });
});

// const data = fs.readFileSync(path.join(__dirname, '../src/rest.css'),'utf-8');
// let cssBuff = data.replace(/[\r\n\s]/g, '').replace(/\"/g, "'");
//
// cssBuff = 'module.exports = "' + cssBuff + '"';
//
// fs.writeFileSync(path.join(__dirname, '../dist/rest-css.js'), cssBuff, 'utf-8', function (err, suc) {
//     if (err) throw  err;
//     console.log('success!');
// });