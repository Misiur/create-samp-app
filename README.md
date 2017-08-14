# create-samp-app

Quickly set up your samp environment. Available as CLI tool, or via programmatic access

```
$ create-samp-app --help
Available flags:
-h, --help             This help message
-t, --target           Platform target
-d, --delete           Remove default filterscripts and includes
-c, --compiler         PAWN compiler
-i, --includes         Includes
-p, --plugins          Plugins
-m, --mysql            Mysql plugin version
-s, --mysql-static    Use statically compiled mysql plugin (linux only)
```

Programmatic access:
```
const csa = require('create-samp-app');
csa('./my-rp', {
  target: 'windows',
  delete: true,
  compiler: 'zeex',
  includes: ['YSI'],
  plugins: ['streamer', 'mysql', 'crashdetect', 'sscanf'],
  mysql: 'r39',
});
```