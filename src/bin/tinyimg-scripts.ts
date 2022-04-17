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
    .usage('<inputDir | imgFile> [outputDir] [options]')

  program
    .option('-I, --inputDir <inputDir>', 'imgs or img input dir')
    .option('-F, --imgFile <imgPath>', 'img path')
    .option('-O, --outputDir <outputDir>', 'imgs or img output dir')
    .option('-R, --recursive [boolean]', 'imgs input dir recursive')
    .option('-L, --showLog [boolean]', 'show img tiny log')
    .action(async (options: any) => {
      const { inputDir, imgFile, recursive, showLog } = options
      let outputDir = options.outputDir
      if (inputDir) {
        logger.info('tinyimg by inputDir starting...')
        try {
          await tinyImg.compressImgByDir({
            inputPath: inputDir,
            outputPath: outputDir || inputDir,
            isRecursion: recursive,
            showLog: showLog
          })
        } catch (error) {
          logger.error(error)
          process.exit(1)
        }
      } else if (imgFile) {
        logger.info('tinyimg by imgFile starting...')
        if (!outputDir) {
          outputDir = path.dirname(imgFile)
        }
        try {
          if (tinyImg.IMG_REGEXP.test(path.extname(imgFile))) {
            const currentEnv = process.cwd()
            const filePath = path.join(currentEnv, imgFile)
            const file = fs.readFileSync(filePath)
            const fileName = path.basename(filePath)
            const ouputPath = path.join(currentEnv, outputDir)
            tinyImg.compressImg(file, filePath, fileName, ouputPath).then((msg: string) => {
              showLog && console.log(msg)
              logger.success('tinyimg by imgFile completed')
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
