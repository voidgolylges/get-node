import { tmpdir } from 'os'
import { dirname } from 'path'
import { platform } from 'process'
import { promisify } from 'util'

import del from 'del'
import getNode from 'get-node'

// TODO: replace with `timers/promises` `setTimeout()` after dropping support
// for Node <15.0.0
const pSetTimeout = promisify(setTimeout)

export const getNodeVersion = async function (versionRange, opts) {
  const output = getOutput()
  const { path, version } = await getNode(versionRange, { output, ...opts })
  const cleanup = removeOutput.bind(undefined, path)
  return { output, path, version, cleanup }
}

export const getOutput = function () {
  const id = String(Math.random()).replace('.', '')
  return `${tmpdir()}/test-get-node-${id}`
}

const removeOutput = async function (nodePath) {
  await pSetTimeout(REMOVE_TIMEOUT)

  const nodeDir = getNodeDir(nodePath)
  await del(dirname(nodeDir), { force: true })
}

// We need to wait a little for Windows to release the lock on the `node`
// executable before cleaning it
const REMOVE_TIMEOUT = 1e3

export const getNodeDir = function (nodePath) {
  if (platform === 'win32') {
    return dirname(nodePath)
  }

  return dirname(dirname(nodePath))
}
