const mic       = require('mic'),
      config    = require('./config.json'),
      streamer  = require('./streamer'),
      recorder  = require('./recorder'),
      mixer     = require('./mixer'),
      mailer    = require('./mailer');

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
micInputStream.pipe(mixer.channel[0]);
mixer.channel[0].pipe(streamer.input);
mixer.channel[0].pipe(recorder.input);

//-- Mic event handlers
micInputStream.on('error', err => {
    console.error(`[ MIC ] Error: ${err}`);
});

micInputStream.on('silence', () => {
    console.warn('[ MIC ] Audio: silence detected');
    mailer.alertSilence();
});

micInputStream.on('sound', () => {
    console.info('[ MIC ] Audio: input is back');
    mailer.alertSound();
});

//-- Start everything
streamer.run();
recorder.run();
micInstance.start();
