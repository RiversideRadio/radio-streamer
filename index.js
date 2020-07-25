const portAudio = require('naudiodon'),
      config    = require('./config.json'),
      streamer  = require('./streamer'),
      recorder  = require('./recorder'),
      mixer     = require('./mixer'),
      mailer    = require('./mailer'),
      IsSilence = require('./silence');

//-- PortAudio setup
let ai = new portAudio.AudioIO({
    inOptions: {
        channelCount: config.common.format.channels,
        sampleFormat: config.input.format.bitDepth,
        sampleRate: config.common.format.sampleRate,
        deviceId: config.input.deviceId,
        closeOnError: false
    }
});

//-- Silence detector setup
silenceDetect = new IsSilence({debug: false});
silenceDetect.setNumSilenceFramesExitThresh(
    parseInt(config.input.silentFrames, 10)
);

//-- Pipe audio to modules
ai.pipe(silenceDetect);
silenceDetect.pipe(mixer.channel[0]);
mixer.channel[0].pipe(streamer.input);
mixer.channel[0].pipe(recorder.input);

//-- PortAudio event handlers
ai.on('error', err => {
    console.error(`[ AUD ] Error: ${err}`);
});

silenceDetect.on('silence', () => {
    console.warn('[ AUD ] Audio: silence detected');
    mailer.alertSilence();
});

silenceDetect.on('sound', () => {
    console.info('[ AUD ] Audio: input is back');
    mailer.alertSound();
});

//-- Start everything
streamer.run();
recorder.run();
ai.start();
