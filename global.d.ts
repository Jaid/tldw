declare module '*.css' {
  const text: string
  export default text
}

declare module 'remote-target' {
  export default class RemoteTarget {
    constructor(target: string)
    run<Result>(callback: () => Result | Promise<Result>): Promise<Result>
  }
}
