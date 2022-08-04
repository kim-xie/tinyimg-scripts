import semver from 'semver'
import log from './logger'

export function checkNodeVersion(requireNodeVersion: string) {
  if (!semver.satisfies(process.version, requireNodeVersion)) {
    log.error(`You are using Node ${process.version}`)
    log.error(`tinyimg-scripts requires Node ${requireNodeVersion}, please update Node.`)
    process.exit(1)
  }
}
