const path = require('path')
const fse = require('fs-extra')
const conventionalChangelog = require('conventional-changelog')

const changelog = async cb => {
  const changelogPath = path.join('./', 'CHANGELOG.md')
  // 对命令 conventional-changelog -p angular -i CHANGELOG.md -w -r 0
  const changelogPipe = await conventionalChangelog({
    preset: 'angular',
    releaseCount: 0
  })
  changelogPipe.setEncoding('utf8')

  const resultArray = ['# tinyImg更新日志\n\n']
  changelogPipe.on('data', chunk => {
    // 原来的 commits 路径是进入提交列表
    chunk = chunk.replace(/\/commits\//g, '/commit/')
    resultArray.push(chunk)
  })
  changelogPipe.on('end', async () => {
    await fse.createWriteStream(changelogPath).write(resultArray.join(''))
    cb()
  })
}

changelog(() => {
  console.log('generate changelog is successful')
})
