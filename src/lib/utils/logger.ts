const chalk = require('chalk')

module.exports = {
  info: (text: string = '') => console.log(`${chalk.bgBlue('[INFO]')} ${chalk.white(text)}`),
  success: (text: string = '') => console.log(`${chalk.bgGreen('[SUCCESS]')} ${chalk.green(text)}`),
  warn: (text: string = '') => console.log(`${chalk.bgYellow('[WARN]')} ${chalk.yellow(text)}`),
  error: (text: string = '') => console.log(`${chalk.bgRed('[ERROR]')} ${chalk.red(text)}`)
}
