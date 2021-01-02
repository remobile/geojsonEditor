const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs-extra");
const shell = require('shelljs');
const config = require("./config");
const _ = require('lodash');

const app = express();
//这里指定参数使用 json 格式
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb", parameterLimit: 1000000 }));
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
    console.log(`请求内容：${JSON.stringify(req.path, 2)}`);
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
    const { version, name, data } = req.body;
    if (version) {
        console.log(`git reset --hard ${version}`);
        shell.exec(`git reset --hard ${version}`);
    }
    console.log('writeFileSync file');
    fs.writeFileSync('file', data);
    console.log('git add file');
    shell.exec('git add file');
    console.log(`git commit -m "${name}"`);
    shell.exec(`git commit -m "${name}"`, { silent:true }, (code, stdout, stderr) => {
        res.json({ success: true, context: { version:  stdout.split(/\n/)[0].replace(/.* ([0-9a-z]*)\].*/, '$1'), name } });
    });
});
// getHistoryList
router.post("/getHistoryList", (req, res, next) => {
    shell.exec('git log --pretty=format:"%h|%s"', { silent:true }, (code, stdout, stderr) => {
        res.json({
            success: true,
            context: {
                config,
                jsonText: fs.readFileSync('file', 'utf-8'),
                list: _.reverse(stdout.split(/\n/).map(o=>{
                    const items = o.split('|');
                    return { version: items[0], name: items[1] };
                }))
            }
        });
    });
});
// getHistoryData
router.post("/getHistoryData", (req, res, next) => {
    const { version } = req.body;
    shell.exec(`git checkout ${version} file`);
    res.json({ success: true, context: fs.readFileSync('file', 'utf-8') });
    shell.exec(`git checkout head file`);
});
app.use(`${config.contextPath}/api`,router);

function main() {
    shell.cd(gitdir);
    const server = app.listen(config.port, () => {
        console.log(`server listenig at http://localhost:${config.port}/geo`);
        }
    );
}
main();
