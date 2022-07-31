#!/usr/bin/env node
const program = require('commander')
const path = require('path')
const fs = require('fs')
const packageInfo = require('../../package.json')
const tinyImg = require('../lib/core/tinyImg')
const logger = require('../lib/utils/logger')

;(async () => {
  program
    .version(packageInfo.version, '-V, --version')
    .usage('<imgDir | imgPath> [outputDir] [options]')

  program
    .option('-I, --imgDir <imgDir>', 'imgs or img input dir')
    .option('-F, --imgPath <imgPath>', 'img path')
    .option('-O, --outputDir <outputDir>', 'imgs or img output dir')
    .option('-M, --minLimit [number]', 'img min limit size')
    .option('-R, --recursive [boolean]', 'imgs input dir recursive')
    .option('-L, --showLog [boolean]', 'show img tiny log')
    .action(async (options: any) => {
      const { imgDir, imgPath, recursive, showLog, minLimit } = options
      let outputDir = options.outputDir
      if (imgDir) {
        logger.info('compress image by imgDir starting...')
        try {
          await tinyImg.compressImgByDir({
            inputPath: imgDir,
            outputPath: outputDir || imgDir,
            isRecursion: recursive,
            showLog,
            minLimit,
            cb: (total: number) => {
              logger.success(`compress image by imgDir completed, ${total} images in total`)
            }
          })
        } catch (error) {
          logger.error(error)
          process.exit(1)
        }
      } else if (imgPath) {
        logger.info('compress image by imgPath starting...')
        if (!outputDir) {
          outputDir = path.dirname(imgPath)
        }
        try {
          if (tinyImg.IMG_REGEXP.test(path.extname(imgPath))) {
            const currentEnv = process.cwd()
            const fileRealPath = path.join(currentEnv, imgPath)
            const file = fs.readFileSync(fileRealPath)
            const inputPath = path.dirname(imgPath)
            const fileName = path.basename(fileRealPath)

            const filePath = imgPath.indexOf('/') > -1 ? imgPath.split('/').join('\\') : imgPath
            const outputPath =
              outputDir.indexOf('\\') > -1 ? outputDir.split('\\').join('/') : outputDir

            tinyImg
              .compressImg(file, filePath, fileName, inputPath, outputPath, minLimit)
              .then((msg: string) => {
                showLog && console.log(msg)
                logger.success('compress image by imgPath completed')
              })
          }
        } catch (error) {
          logger.error(error)
          process.exit(1)
        }
      }
    })

  program.parse(process.argv)

  program.showHelpAfterError()

  const proc = program.runningCommand

  if (proc) {
    proc.on('close', process.exit.bind(process))
    proc.on('error', () => {
      process.exit(1)
    })
  }
})()
