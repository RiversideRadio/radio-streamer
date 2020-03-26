const nodeshout     = require('nodeshout'),
      ShoutStream   = nodeshout.ShoutStream,
      lame          = require('lame'),
      config        = require('./config.json');

//-- Shout setup
nodeshout.init();
let shout = nodeshout.create();
    shout.setName(config.stream.metadata.name);
    shout.setDescription(config.stream.metadata.description);
    shout.setGenre(config.stream.metadata.genre);
    shout.setUrl(config.stream.metadata.url);
    shout.setHost(config.stream.server.host);
    shout.setPort(config.stream.server.port);
    shout.setUser(config.stream.server.user);
    shout.setPassword(config.stream.server.password);
    shout.setMount(config.stream.server.mount);
    shout.setFormat(1); // 0=ogg, 1=mp3
    shout.setAudioInfo('bitrate', config.stream.format.bitrate);
    shout.setAudioInfo('samplerate', config.common.format.sampleRate);
    shout.setAudioInfo('channels', config.common.format.channels);

//-- Encoder setup
let encoder = new lame.Encoder({
    // input
    channels: config.common.format.channels,
    bitDepth: config.input.format.bitDepth,
    sampleRate: config.common.format.sampleRate,
    
    // output
    bitRate: config.stream.format.bitrate,
    outSampleRate: config.common.format.sampleRate,
    mode: config.common.format.channels == 2 ? lame.STEREO : lame.MONO
});

//-- Routing
//  Pipe encoded audio to Shout stream
const shoutStream = encoder.pipe(new ShoutStream(shout));

const run = function() {
    const res = shout.open();
    if (res == nodeshout.ErrorTypes.SUCCESS) {
        console.info('[ STR ] Stream started');
    } else {
        for (const type in nodeshout.ErrorTypes) 
            if (res == nodeshout.ErrorTypes[type]) 
                return console.error(`[ STR ] Error: ${type}`);
    }
}

exports.input   = encoder;
exports.run     = run;