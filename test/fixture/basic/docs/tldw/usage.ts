import RemoteTarget from 'remote-target'

const remoteTarget = new RemoteTarget('vps')

const result = await remoteTarget.run(async () => {
  const fs = await import('node:fs/promises')
  return await fs.readdir('/')
})
