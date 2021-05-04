const filewatcher = require('filewatcher');

var watcher = filewatcher();

watcher.add(__dirname);

watcher.on('change', function(file, stat) {
    console.log('File modified occured : %s', file);
    console.log(stat)
    if (!stat) console.log('deleted');
    
});