# node-git-hooks

> Node.js managed git hooks

:construction: ...work in progress... :construction:

## Installation

```
$ npm install -g node-git-hooks
$ cd <repo>
$ git-hooks install
```

## Usage

A fresh installation will produce a `.githooks.yml` file in the root of your
directory with all known githooks, e.g.:

```yml
pre-commit:
  - npm test

commit-msg:
  - node hooks/tpope.js
```

Each entry for each hook name will be executed in series for the incoming
hook. To examine the rendered script that will be run, check the
`.git/hooks/.cache` directory.

> Note: The cache will be busted and renewed whenever
> a change to `.githooks.yml` is detected during execution of a git hook.
> This ensures snappy feedback.
