const Fader = require('./fader');

const channel = (new Array(2)).fill(Fader(1));

exports.channel = channel;
