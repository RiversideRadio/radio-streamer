const mic       = require('mic'),
      config    = require('./config.json'),
      streamer  = require('./streamer'),
      recorder  = require('./recorder');

//-- Microphone setup
let micInstance = mic({
    device: config.input.device,
    rate: config.common.format.sampleRate,
    channels: config.common.format.channels,
    debug: false,
    exitOnSilence: config.input.silentFrames || 325 // about 30s (1 frame ≈ 93ms)
});

//-- Pipe mic to modules
let micInputStream = micInstance.getAudioStream();
micInputStream.pipe(streamer.input);
micInputStream.pipe(recorder.input);

//-- Mic event handlers
micInputStream.on('error', (err) => {
    console.error(`[ MIC ] Error: ${err}`);
});

micInputStream.on('silence', function() {
    console.warn('[ MIC ] Audio: silence detected');
});

micInputStream.on('sound', function() {
    console.info('[ MIC ] Audio: input is back');
});

//-- Start everything
streamer.run();
recorder.run();
micInstance.start();
