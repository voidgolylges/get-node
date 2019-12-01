import { promisify } from 'util'

import { gte as gteVersion } from 'semver'
// TODO: use `require('stream').pipeline` after dropping support for Node 8/9
import pump from 'pump'

import { fetchNodeUrl, promiseOrFetchError, writeNodeBinary } from '../fetch.js'
import { getArch } from '../arch.js'

const pPump = promisify(pump)

// On Windows, when no zip archive is available (old Node.js versions), download
// the raw `node.exe` file available for download instead.
export const downloadRaw = async function(version, tmpFile, opts) {
  const filepath = getFilepath(version)
  const { response, checksumError } = await fetchNodeUrl(
    version,
    filepath,
    opts,
  )
  const promise = pPump(response, writeNodeBinary(tmpFile))

  await promiseOrFetchError(promise, response)

  return checksumError
}

// Before Node.js 4.0.0, the URL to the node.exe was different
const getFilepath = function(version) {
  const arch = getArch()

  if (gteVersion(version, NEW_URL_VERSION)) {
    return `win-${arch}/node.exe`
  }

  // We currently only run CI tests on Windows x64
  // istanbul ignore else
  if (arch === 'x64') {
    return 'x64/node.exe'
  }

  // istanbul ignore next
  return 'node.exe'
}

const NEW_URL_VERSION = '4.0.0'
