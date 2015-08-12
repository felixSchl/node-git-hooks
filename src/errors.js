export class AlreadyInstalledError extends Error {
  constructor() {
    super();
    Error.call(
      this
    , '`git-hooks` has already been installed. '
    + 'Use `-f` to force a re-install');
    Error.captureStackTrace(this, this.constructor);
    Object.defineProperty(this, 'name', {
      configurable : true,
      enumerable : false,
      value : this.constructor.name,
    });
  }
}
