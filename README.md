# node-git-hooks

> Node.js managed git hooks

## Infectation

```
$ npm install -g node-git-hooks
$ cd <repo>
$ git-hooks infect
```

This will "infect" the current `GIT_DIR` with hooks generated from the
repository local `.githooks.yml`. When `git-hooks infect` is run for the
first time, a sample `.githooks.yml` will be generated and placed in the
root of the repository, where it is expected.

The process is called "infectation" because once the initial script has been
installed, any triggered git hook will update the scripts and run the most
up-to-date `.githook.yml`, essentially allowing you to version control and
almost enforce a policy by using git hooks.

## Usage

A fresh infectation will produce a `.githooks.yml` file in the root of your
directory with all known githooks, e.g.:

```yml
pre-commit:
  - npm test

commit-msg:
  - node hooks/tpope.js
```

For each hookname, each entry in it's array is executed in series when the hook
of that type gets triggered by git. To examine the rendered script that will be
run, check the `.git/hooks/.cache` directory.

> Note: The cache will be busted and renewed whenever
> a change to `.githooks.yml` is detected during execution of a git hook.
> This ensures snappy feedback.

## Desinfectation

For now, you will just have to remove your `.git/hooks` folder manually.
