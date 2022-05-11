# 介绍

tinyimg-scripts 是一个在线图片压缩 node 命令行工具, 底层依赖 tinypng.com | tinyjpg.com

## 1. 如何使用

**安装:**

```shell
yarn add -g tinyimg-scripts
```

or

```shell
npm install -g tinyimg-scripts
```

**如何使用:**

```shell
$ tinyimg-scripts -h
Usage: tinyimg-scripts <imgDir | imgPath> [outputDir] [options]

Options:
  -V, --version                output the version number
  -I, --imgDir <imgDir>        imgs or img input dir
  -F, --imgPath <imgPath>      img path
  -O, --outputDir <outputDir>  imgs or img output dir
  -R, --recursive [boolean]    imgs input dir recursive
  -L, --showLog [boolean]      show img tiny log
  -h, --help                   display help for command
```

```shell
$ tinyimg-scripts -I img -O outputDir -R -L

# or

$ tinyimg-scripts -F img/A.png -O outputDir -L
```
