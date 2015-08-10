import _ from 'lodash';
export default _.foldl(
  [ 'applypatch-msg'
  , 'pre-applypatch'
  , 'post-applypatch'
  , 'pre-commit'
  , 'prepare-commit-msg'
  , 'commit-msg'
  , 'post-commit'
  , 'pre-rebase'
  , 'post-checkout'
  , 'post-merge'
  , 'pre-receive'
  , 'update'
  , 'post-receive'
  , 'post-update'
  , 'pre-auto-gc'
  , 'post-rewrite'
  , 'pre-push' ]
, (acc, name) => (acc[name] = name) && acc, {});

