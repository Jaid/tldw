declare module '*.css' {
  const text: string
  export default text
}
declare module '*.hbs' {
  const text: string
  export default text
}
declare module 'remote-target' {
  export default class RemoteTarget {
    constructor(target: string)
    run<Result>(callback: () => Promise<Result> | Result): Promise<Result>
  }
}
