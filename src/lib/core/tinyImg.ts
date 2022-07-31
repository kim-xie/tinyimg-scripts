/**
 * 图片处理相关工具
 */
const Fs = require('fs')
const Path = require('path')
const Https = require('https')
const Url = require('url')
const Chalk = require('chalk')

/**
 * 支持压缩的图片格式
 */
const IMG_REGEXP = /\.(jpe?g|png)$/

/**
 * 在线压缩网站
 */
const TINYIMG_URL = ['tinyjpg.com', 'tinypng.com']

/**
 * @remarks 字节转换
 * @param byte 字节
 * @returns
 */
const ByteSize = (byte = 0) => {
  if (byte === 0) return '0 B'
  const unit = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(byte) / Math.log(unit))
  return (byte / Math.pow(unit, i)).toPrecision(3) + ' ' + sizes[i]
}

/**
 * 生成一定范围随机数
 * @param min
 * @param max
 * @returns
 */
const RandomNum = (min = 0, max = 10) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * 四舍五入
 * @param num
 * @param dec
 * @param per
 * @returns
 */
const RoundNum = (num = 0, dec = 2, per = false) => {
  return per
    ? Math.round(num * 10 ** dec * 100) / 10 ** dec + '%'
    : Math.round(num * 10 ** dec) / 10 ** dec
}

/**
 * 判断目录或文件夹是否存在？不存在测创建
 * @param pathStr
 * @returns
 */
const mkdirPath = async (pathStr: string) => {
  const currentPath = pathStr
  try {
    const isExisted = await isFileExisted(currentPath)
    if (isExisted) {
      const tempstats = Fs.statSync(currentPath)
      if (!tempstats.isDirectory()) {
        Fs.unlinkSync(currentPath)
        Fs.mkdirSync(currentPath)
      }
    } else {
      // 只能一级一级生成
      // Fs.mkdirSync(currentPath)

      // 可以跨层级生成
      mkdirSyncUtil(currentPath)
    }
  } catch (err) {
    console.log(Chalk.red('文件生成出错啦！'))
  }
  return currentPath
}

const mkdirSyncUtil = (dirname: string) => {
  try {
    if (Fs.existsSync(dirname)) {
      return dirname
    } else {
      if (mkdirSyncUtil(Path.dirname(dirname))) {
        Fs.mkdirSync(dirname)
        return dirname
      }
    }
  } catch (error) {
    console.log(Chalk.red('文件生成出错啦！'))
  }
}

/**
 * 判断路径是否存在
 * @param inputpath
 * @returns
 */
const isFileExisted = (inputpath: string) => {
  return new Promise(resolve => {
    Fs.access(inputpath, (err: any) => {
      if (err) {
        resolve(false) // "不存在"
      } else {
        resolve(true) // "存在"
      }
    })
  })
}

/**
 * 图片压缩网站请求头
 * @returns
 */
const RandomHeader = () => {
  const ip = new Array(4)
    .fill(0)
    .map(() => parseInt((Math.random() * 255).toString()))
    .join('.')
  const index = RandomNum(0, 1)
  return {
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Postman-Token': Date.now(),
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
      'X-Forwarded-For': ip
    },
    method: 'POST',
    host: TINYIMG_URL[index],
    path: '/web/shrink',
    rejectUnauthorized: false
  }
}

/**
 * 图片压缩工具
 * @remarks 图片在线压缩工具
 * @param file 需要压缩的图片文件
 * @param filename 需要压缩的图片名称
 * @param outputPath 压缩后的输出目录
 * @returns Promise
 */
const compressImg = async (
  file: any,
  filePath: string,
  filename: string,
  inputPath: string,
  outputPath: string,
  minLimit: number
) => {
  try {
    const fileSize = Fs.statSync(filePath)['size']
    if (fileSize / 1024 < minLimit) {
      const msg = `[${Chalk.greenBright(filePath)}] size is ${Chalk.redBright(
        ByteSize(fileSize)
      )} less than minLimit ${Chalk.redBright(minLimit)} KB so not tiny`
      console.log(msg)
      return Promise.reject()
    }
    const uploadResponse: any = await uploadImg(file)
    const downloadData = await downloadImg(uploadResponse.output.url)
    const oldSize = Chalk.redBright(ByteSize(uploadResponse.input.size))
    const newSize = Chalk.greenBright(ByteSize(uploadResponse.output.size))
    const ratio = Chalk.blueBright(RoundNum(1 - uploadResponse.output.ratio, 2, true))
    const pathName = filePath
      .replace(inputPath?.replace('/', '\\'), outputPath?.replace('/', '\\'))
      .replace(filename, '')
    const currentPath = await mkdirPath(pathName)
    const outputFilePath = Path.join(currentPath as string, filename)

    Fs.writeFileSync(outputFilePath, downloadData as NodeJS.ArrayBufferView, 'binary')

    const msg = `Compress [${Chalk.greenBright(filePath)}] completed to [${Chalk.greenBright(
      outputFilePath
    )}]: Old Size ${oldSize}, New Size ${newSize}, Optimization Ratio ${ratio}`
    return Promise.resolve(msg)
  } catch (err) {
    const msg = `Compress [${Chalk.greenBright(filePath)}] failed: ${Chalk.redBright(err)}`
    return Promise.resolve(msg)
  }
}

/**
 * 图片压缩后下载
 * @param url
 * @returns
 */
const downloadImg = (url: string) => {
  const opts = new Url.URL(url)
  return new Promise((resolve, reject) => {
    const req = Https.request(opts, (res: any) => {
      let file = ''
      res.setEncoding('binary')
      res.on('data', (chunk: any) => (file += chunk))
      res.on('end', () => resolve(file))
    })
    req.on('error', (err: any) => reject(err))
    req.end()
  })
}

/**
 * 图片上传压缩
 * @param file
 * @returns
 */
const uploadImg = (file: any) => {
  const opts = RandomHeader()
  return new Promise((resolve, reject) => {
    const req = Https.request(opts, (res: any) =>
      res.on('data', (data: any) => {
        const obj = JSON.parse(data.toString())
        obj.error ? reject(obj.message) : resolve(obj)
      })
    )
    req.write(file, 'binary')
    req.on('error', (err: any) => reject(err))
    req.end()
  })
}

/**
 * 根据文件夹进行图片压缩
 * @param dirPath 需要压缩的图片文件夹路径
 * @param outputPath 压缩后输出的目录
 * @param isRecursion 是否需要递归压缩 @defaultValue true
 * @param showLog 压缩过程是否需要打开日志 @defaultValue true
 *
 * @returns void
 */
const compressImgByDir = ({
  inputPath,
  outputPath,
  isRecursion,
  showLog,
  minLimit,
  cb
}: {
  inputPath: string
  outputPath: string
  isRecursion: boolean
  showLog: boolean
  minLimit: number
  cb?: (total: number) => void
}) => {
  let total = 0
  let len = 0
  readDirFile(inputPath, isRecursion, (filePath, fileName) => {
    if (IMG_REGEXP.test(Path.extname(fileName))) {
      total++
      const file = Fs.readFileSync(filePath)
      compressImg(file, filePath, fileName, inputPath, outputPath, minLimit)
        .then(
          msg => {
            showLog && console.log(msg)
            len++
            if (cb && total === len) {
              cb(Chalk.red(total))
            }
          },
          msg => {
            showLog && console.log(msg)
            total--
          }
        )
        .catch(err => {
          console.log('图片压缩报错啦', err)
        })
    }
  })
}

/**
 * 异步递归读取文件夹下的文件
 * */
function readDirFile(
  currentDirPath: any,
  isRecursion: boolean,
  callback: (filePath: string, name: string, stats: any) => void
) {
  Fs.readdir(currentDirPath, (err: any, files: any) => {
    if (err) {
      console.warn(err)
      return
    }
    files.forEach((name: string) => {
      const filePath = Path.join(currentDirPath, name)
      Fs.stat(filePath, (error: any, stats: any) => {
        if (error) {
          console.warn(Chalk.red('获取文件stats失败'))
        } else {
          const isFile = stats.isFile() // 是文件
          const isDir = stats.isDirectory() // 是文件夹
          if (isFile) {
            callback && callback(filePath, name, stats)
          }
          if (isDir && isRecursion) {
            readDirFile(filePath, isRecursion, callback)
          }
        }
      })
    })
  })
}

/**
 * 模块导出
 */
module.exports = {
  RandomHeader,
  RoundNum,
  ByteSize,
  uploadImg,
  downloadImg,
  compressImg,
  compressImgByDir,
  IMG_REGEXP
}
