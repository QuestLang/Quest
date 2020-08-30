const run = require('./src/runquest');

// Run The Main Quest Files
run('src/lib/math.qst');

// User Generated
run('main.qst', false);