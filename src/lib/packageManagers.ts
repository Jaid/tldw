export const supportedPackageManagers = ['bun', 'npm', 'pnpm', 'yarn', 'deno'] as const

export type PackageManager = typeof supportedPackageManagers[number]

export const defaultPackageManagers: Array<PackageManager> = ['npm']
