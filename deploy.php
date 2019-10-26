<?php
/***********************************************************************
 ** 远程部署工具
 ** 工作流程：将本文件放到需要部署代码的文件夹下, 程序自动下载,解压,备份
远程目录,协议为HTTP协议,文件格式为ZIP
 ** 账号配置：配置config中的auth_username和auth_password
 ** 安全配置：配置config中的allow_domains, 允许远程下载的域名或主机IP
 **********************************************************************/

ini_set('display_errors', 'on');

$config = [
    'auth_username' => 'frontend',
    'auth_password' => '123!@#asd',
    'allow_domains' => [
        'dl.zytec.cn',
        '114.115.150.3',
        '192.168.31.222',
    ],
];

define('EOL', PHP_EOL);

if (!($_SERVER['PHP_AUTH_USER'] === $config['auth_username'] &&
    $_SERVER['PHP_AUTH_PW'] === $config['auth_password']))
{
    header('WWW-Authenticate: Basic realm="Toolkit"');
    header('HTTP/1.0 401 Unauthorized');
    exit(0);
}

for($i = 0;$i<count($_FILES['file']['name']);$i++){
    if ($_FILES["file"]["type"][$i] == "application/octet-stream")
    {
        if ($_FILES["file"]["error"][$i] > 0)
        {
            echo "Return Code: " . $_FILES["file"]["error"][$i] .EOL;
        }
        else
        {
            echo "Upload: " . $_FILES["file"]["name"][$i] . EOL;
            echo "Type: " . $_FILES["file"]["type"][$i] . EOL;
            echo "Size: " . ($_FILES["file"]["size"][$i] / 1024) . EOL;
            echo "Temp file: " . $_FILES["file"]["tmp_name"][$i] . EOL;

            if (file_exists(__DIR__.DIRECTORY_SEPARATOR . $_FILES["file"]["name"][$i]))
            {
                unlink(__DIR__.DIRECTORY_SEPARATOR. $_FILES["file"]["name"][$i]);
            }

                move_uploaded_file($_FILES["file"]["tmp_name"][$i],
                    __DIR__.DIRECTORY_SEPARATOR . $_FILES["file"]["name"][$i]);
                echo "Stored in: " . __DIR__.DIRECTORY_SEPARATOR. $_FILES["file"]["name"][$i].EOL;
        }
    }
    else
    {
        echo "Invalid file".EOL;
    }

    $targetDirName = pathinfo($_FILES["file"]["name"][$i])['filename'];
    $downloadedFile = __DIR__.DIRECTORY_SEPARATOR. $_FILES["file"]["name"][$i];
    $targetDir = __DIR__ . DIRECTORY_SEPARATOR . $targetDirName;
    if (is_dir($targetDir)) {
        $targetDirBak = $targetDir.date("_Ymd_His");
        if (rename($targetDir, $targetDirBak)) {
            echo '目标文件夹 ' . $targetDirName . ' 备份完成, 备份路径为: ' . $targetDirBak . EOL;
        } else {
            echo '目标文件夹 ' . $targetDirName . ' 备份失败'.EOL;
            goto clean;
        }
    }

    echo $targetDirName.'正在解压文件......' . EOL;

    $zip = new ZipArchive;
    if ($zip->open($downloadedFile) === true) {
        $zip->extractTo($targetDir);
        $zip->close();
        echo $targetDirName.'文件解压完成' . EOL;
    } else {
        echo $targetDirName.'文件解压失败'.EOL;
        goto clean;
    }

    echo $targetDirName.'部署完成' . EOL;

    clean:

    if (unlink($downloadedFile)) {
        echo $targetDirName.'资源回收完成' . EOL;
    } else {
        echo $targetDirName.'资源回收失败'.EOL ;
    }
}



