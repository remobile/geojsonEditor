const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs-extra");
const shell = require('shelljs');
const config = require("./config");
const _ = require('lodash');

const app = express();
//这里指定参数使用 json 格式
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(config.contextPath, express.static(path.resolve('public')));

//设置跨域访问
app.all("*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", " 3.2.1");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.post("*", (req, res, next) => {
    console.log(`请求内容：${JSON.stringify(req.path, 2)}`, req.body);
    next();
});

const gitdir = path.join(process.cwd(), '.gitdir');
const router = express.Router();
// resetHistory
router.post("/resetHistory", (req, res, next) => {
    fs.emptyDirSync(gitdir);
    shell.exec('git init .');
    res.json({ success: true });
});
// setHistory
router.post("/setHistory", (req, res, next) => {
    const { log, name, data } = req.body;
    fs.writeFileSync('file', JSON.stringify(data, null, 2));
    if (log) {
        shell.exec(`git reset --hard ${log}`);
    }
    shell.exec('git add file');
    shell.exec(`git commit -m "${name}"`, { silent:true }, (code, stdout, stderr) => {
        res.json({ success: true, context: { version:  stdout.split(/\n/)[0].split(/[\s\]]/)[1], name } });
    });
});
// getHistoryList
router.post("/getHistoryList", (req, res, next) => {
    shell.exec('git log --pretty=format:"%h|%s"', { silent:true }, (code, stdout, stderr) => {
        res.json({ success: true, context: { list: stdout.split(/\n/).map(o=>{ const items = o.split('|'); return { version: items[0], name: items[1] } }) } }); });
    });
});
// getHistoryData
router.post("/getHistoryData", (req, res, next) => {
    const { version } = req.body;
    shell.exec(`git checkout ${version} file`);
    res.json({ success: true, context: fs.readFileSync('file'));
    shell.exec(`git checkout head file`);
});
app.use(`${config.contextPath}/api`,router);

function main() {
    shell.cd(gitdir);
    const server = app.listen(4050, () => {
        console.log(`server listenig at http://localhost:${server.address().port}`);
        }
    );
}
main();
