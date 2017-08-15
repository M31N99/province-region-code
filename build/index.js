/**
 * Created by 2ue on 2017/8/14.
 */

const fs = require('fs');
const path = require('path');

const spider = require('../src/');

const targetPath = path.join(__dirname, '../dist/data');

spider.then(function (res) {
    const text = !res ? '' : JSON.stringify(res);
    const js_text = "module.exports = '" + text + "'";

    //先清除上次的生成的文件
    if (fs.existsSync(targetPath)) {
        const files = fs.readdirSync(targetPath);
        files.forEach(function (file, index) {
            const curPath = path.join(targetPath, file);
            if (fs.statSync(curPath).isDirectory()) {
                fs.rmdirSync(targetPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
    }else {
        fs.mkdirSync(targetPath);
    }
    //写入json
    fs.writeFileSync(path.join(targetPath, 'index.json'), text, 'utf-8', function (err, suc) {
        if (err) throw  err;
        console.log('success json!');
    });
    //写入js
    fs.writeFileSync(path.join(targetPath, 'index.js'), js_text, 'utf-8', function (err, suc) {
        if (err) throw  err;
        console.log('success js!');
    });
});