前端代码为VUE编写，已经打好包：根路径/deploy/frontend，下载文件夹frontend(注：文件夹目录不要修改，代码中按路径引用文件)
如需自己打包，需要进入项目根目录，执行：npm run build demo_template。所需依赖工具安装不做说明
1.拷贝文件夹“frontend”到tomcat/webapps下，部署目录如下
2.修改文件smilecampus_config.js，base_url修改为后台地址
3.启动tomcat，访问如下地址