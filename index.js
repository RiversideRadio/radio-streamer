const portAudio = require('naudiodon'),
      config    = require('./config.json'),
      streamer  = require('./streamer'),
      recorder  = require('./recorder'),
      mixer     = require('./mixer'),
      mailer    = require('./mailer');

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

//-- Pipe audio to modules
ai.pipe(mixer.channel[0]);
mixer.channel[0].pipe(streamer.input);
mixer.channel[0].pipe(recorder.input);

//-- PortAudio event handlers
ai.on('error', err => {
    console.error(`[ AUD ] Error: ${err}`);
});

//-- Start everything
streamer.run();
recorder.run();
ai.start();
