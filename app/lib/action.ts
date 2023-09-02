export abstract class Action<T, R> {
  constructor(public readonly name: string) {}
  abstract run(args: T): Promise<R>;
}
