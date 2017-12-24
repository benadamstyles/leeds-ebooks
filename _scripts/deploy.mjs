// @flow

import fs from 'fs'
import p from 'path'
import {promisify} from 'util'
import loadJson from 'load-json-file'
import Ftp from 'jsftp'
import _ from 'highland'
import Log from 'log-color-optionaldate'
import Progress from 'progress'
import {deploy} from '../package.json'

const log = new Log({level: 'info', color: true, date: false})
const {host, port, authKey} = deploy.auth
const ftp = new Ftp({host, port})
ftp.useList = true

const auth = promisify(ftp.auth.bind(ftp))
const raw = promisify(ftp.raw.bind(ftp))
const put = promisify(ftp.put.bind(ftp))

const {src: localRoot, dest: remoteRoot} = deploy

const isDirectory = path => fs.lstatSync(path).isDirectory()

const dirParseSync = (startDir, result = {[p.sep]: []}) =>
  fs.readdirSync(startDir).reduce((res, file, i) => {
    if (isDirectory(p.join(startDir, file))) {
      const tmpPath = p.relative(localRoot, p.join(startDir, file))
      res[tmpPath] = res[tmpPath] || []
      return dirParseSync(p.join(startDir, file), res)
    } else {
      res[p.relative(localRoot, startDir) || p.sep].push(file)
      return res
    }
  }, result)

const ftpPut = async (path, file) => {
  try {
    await put(p.normalize(p.join(localRoot, path, file)), file)
    log.debug('Uploaded file: ' + file + ' to: ' + path)
  } catch (e) {
    log.error('Cannot upload file: ' + file + ' --> ' + e)
    throw e
  }
}

const ftpCwd = async path => {
  log.debug(`ftpCwd ${path}`)

  try {
    await raw('cwd', path)
  } catch (e) {
    try {
      await raw('mkd', path)
      log.debug('New remote folder created ' + path)
      return ftpCwd(path)
    } catch (e) {
      log.error('Error creating new remote folder', path, '-->', e)
      throw e
    }
  }
}

const ftpProcessLocation = async (path, files, progress) => {
  log.debug(`ftpProcessLocation ${path}`)
  if (!files) throw new Error('Data for ' + path + ' not found')
  await ftpCwd(p.normalize('/' + p.join(remoteRoot, path)))
  for (const file of files) {
    await ftpPut(path, file)
    progress.tick()
  }
}

const getAuthVals = async () => (await loadJson('.ftppass'))[authKey]

void (async () => {
  try {
    const {username, password} = await getAuthVals()
    await auth(username, password)

    const data = dirParseSync(localRoot)
    const total = [].concat(...Object.values(data)).length

    const progress = new Progress(
      '[:bar] :percent :elapseds elapsed :etas remaining',
      {
        total,
        width: 40,
        complete: '•',
        incomplete: ' ',
      }
    )

    await _.pairs(data)
      .map(([path, files]) => _(ftpProcessLocation(path, files, progress)))
      .series()
      .collect()
      .toPromise(Promise)

    await raw('quit')
    log.info('FTP upload completed')
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
