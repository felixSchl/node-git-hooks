export class AlreadyInstalledError extends Error {
  constructor() {
    super();
    Error.call(
      this
    , 'This git repo has already been infected.'
    + 'Use `-f` to force a re-infect');
    Error.captureStackTrace(this, this.constructor);
    Object.defineProperty(this, 'name', {
      configurable : true,
      enumerable : false,
      value : this.constructor.name,
    });
  }
}
