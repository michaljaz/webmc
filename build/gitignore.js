const fs = require('fs');
fs.writeFile(__dirname+"/../.gitignore", '.gitignore\nnode_modules', function (err) {
  if (err) return console.log(err);
});