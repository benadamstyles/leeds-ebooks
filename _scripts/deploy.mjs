// @flow

import fs from 'fs'
import p from 'path'
import {promisify} from 'util'
import jsonfile from 'jsonfile'
import Ftp from 'jsftp'
import Log from 'log-color-optionaldate'
import Progress from 'progress'
import {maybe} from 'maybes'
import hashOrig from 'hash-files'
import Store from './json-store.mjs'

// const loglevel = 'debug'
const loglevel = 'info'
const log = new Log({level: loglevel, color: true, date: false})

const isDirectory = path => fs.statSync(path).isDirectory()

const getProgress = total =>
  loglevel !== 'debug'
    ? new Progress('[:bar] :percent :elapseds elapsed :etas remaining', {
        total,
        width: 40,
        complete: '•',
        incomplete: ' ',
      })
    : {tick: x => null}

const hash = promisify(hashOrig)
const getDirectoryHash = files => hash({files, noGlob: true})
const hashStore = new Store('./hashes.json')

const matches = async (path, files) => {
  log.debug(`Checking if hash matches for path ${path}`)
  const newHash = await getDirectoryHash(
    files.map(f => p.join(localRoot, path, f))
  )
  const oldHash = hashStore.get(path)
  const match = newHash === oldHash
  log.debug(`Previous hash ${oldHash}`)
  log.debug(`New hash ${newHash}`)
  log.debug(`Hashes ${match ? 'DO' : 'DON’T'} match`)
  if (!match) hashStore.set(path, newHash)
  return match
}

import {deploy} from '../package.json'
const {src: localRoot, dest: remoteRoot, auth: {host, port, authKey}} = deploy
const ftp = new Ftp({host, port})
ftp.useList = true

const auth = promisify(ftp.auth.bind(ftp))
const raw = promisify(ftp.raw.bind(ftp))
const put = promisify(ftp.put.bind(ftp))

const getAuthVals = async () =>
  (await promisify(jsonfile.readFile)('.ftppass'))[authKey]

const dirParse = (
  startDir,
  result = new Map([[p.sep, []]])
): Map<string, string[]> =>
  fs.readdirSync(startDir).reduce((res, file, i) => {
    if (isDirectory(p.join(startDir, file))) {
      const tmpPath = p.relative(localRoot, p.join(startDir, file))
      if (!res.has(tmpPath)) res.set(tmpPath, [])
      return dirParse(p.join(startDir, file), res)
    } else {
      maybe(res.get(p.relative(localRoot, startDir) || p.sep)).forEach(arr =>
        arr.push(file)
      )
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
  try {
    log.debug(`ftp cwd ${path}`)
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
  log.debug('')
  log.debug(`Processing location ${path}`)
  if (!files) throw new Error(`Data for ${path} not found`)
  await ftpCwd(p.normalize('/' + p.join(remoteRoot, path)))

  if (!await matches(path, files)) {
    for (const file of files) {
      await ftpPut(path, file)
      progress.tick()
    }
  } else {
    log.debug(`Skipping directory ${path}`)
    progress.tick(files.length)
  }
}

void (async () => {
  try {
    const {username, password} = await getAuthVals()
    await auth(username, password)

    const data = dirParse(localRoot)
    const progress = getProgress([].concat(...data.values()).length)

    for (const [path, files] of data) {
      await ftpProcessLocation(path, files, progress)
    }

    await hashStore.close()
    await raw('quit')

    log.info('FTP upload completed')
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
