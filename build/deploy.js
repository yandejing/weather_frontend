const { spawn } = require('child_process');


const http = require('http');
const path = require('path');
const fs = require('fs');
const glob = require('glob')
const chalk = require('chalk')
let options = require('../config/deploy_config')
let appNameArr = []
glob.sync('./src/modules/*').forEach(function (entry) {
  if (entry === 'index.html') {
    return;
  }
  appNameArr.push(entry.split('/').pop())
});
function postFile(fileKeyValue, req) {
  let boundaryKey = Math.random().toString(16);
  let enddata = '\r\n----' + boundaryKey + '--';

  let files =[];
  for (let i = 0; i < fileKeyValue.length; i++) {
    let content = "\r\n----" + boundaryKey + "\r\n" + "Content-Type: application/octet-stream\r\n" + "Content-Disposition: form-data; name=\"" + fileKeyValue[i].urlKey + "\"; filename=\"" + path.basename(fileKeyValue[i].urlValue) + "\"\r\n" + "Content-Transfer-Encoding: binary\r\n\r\n";
    let contentBinary = new Buffer(content, 'utf-8');//当编码为ascii时，中文会乱码。
    files.push({contentBinary: contentBinary, filePath: fileKeyValue[i].urlValue});
  }
  let contentLength = 0;
  for (let i = 0; i < files.length; i++) {
    let stat = fs.statSync(files[i].filePath);
    contentLength += files[i].contentBinary.length;
    contentLength += stat.size;
  }

  req.setHeader('Content-Type', 'multipart/form-data; boundary=--' + boundaryKey);
  req.setHeader('Content-Length', contentLength + Buffer.byteLength(enddata));

  // 将参数发出
  let fileindex = 0;
  let doOneFile = function(){
    req.write(files[fileindex].contentBinary);
    let fileStream = fs.createReadStream(files[fileindex].filePath, {bufferSize : 4 * 1024});
    fileStream.pipe(req, {end: false});
    fileStream.on('end', function() {
      fileindex++;
      if(fileindex == files.length){
        req.end(enddata);
      } else {
        doOneFile();
      }
    });
  };
  if(fileindex == files.length){
    req.end(enddata);
  } else {
    doOneFile();
  }
}
function deploy(module){
  let files = []
  let filePath = path.resolve(__dirname, '../dist',module+'.zip');
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
  } catch (err) {
    console.error(chalk.red('项目 '+module+' 未编译，请先编译'));
    return;
  }
  files.push({urlKey: "file[]", urlValue: path.resolve(__dirname, '../dist',module+'.zip')},)
  for(let j = 0;j<options.length;j++){
    let req = http.request(options[j], function(res){
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      console.log("正在上传"+options[j]['intro']+'...');
      //res.setEncoding("utf8");
      res.on("data", function(chunk){
        console.log("BODY:" + chunk);
        console.log(chalk.green(options[j]['intro']+' 的 '+module+ ' 模块已成功部署'));
      })
    })

    req.on('error', function(e){
      console.log(chalk.red("上传"+options[j]['intro']+'出错'));
      console.log(chalk.red('problem with request:' + e.message));
      console.log(chalk.red(e));
    })
    postFile(files, req);
    console.log(chalk.green("开始部署 "+options[j]['intro']+' 的 '+module+ ' 模块'));
  }
}


for(let i =2;i<process.argv.length;i++){
  if(!process.argv[i]){
    console.log(chalk.red('请输入模块名称'))
    process.exit(0)
  } else if (appNameArr.indexOf(process.argv[i]) < 0) {
    console.log(chalk.red('请输入正确的模块名'))
    process.exit(0)
  }
  if(process.env.npm_config_no_build){
    deploy(process.argv[i]);
  }else{
    let childProcess = spawn('node', ['build/build.js',process.argv[i]]);
    childProcess.stdout.on('data', (data) => {
      console.log(`${process.argv[i]}: ${data}`);
    });
    childProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      deploy(process.argv[i]);
    });
  }


}









