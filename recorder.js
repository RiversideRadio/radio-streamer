const lame      = require('lame'),
      fs        = require('fs'),
      Transform = require('stream').Transform,
      clock     = require('event-clock'),
      cleanup   = require('./folder-cleanup'),
      config    = require('./config.json');

//-- Encoder setup
const encoder = new lame.Encoder({
    // input
    channels: config.common.format.channels,
    bitDepth: config.input.format.bitDepth,
    sampleRate: config.common.format.sampleRate,
    
    // output
    bitRate: config.recorder.format.bitrate,
    outSampleRate: config.common.format.sampleRate,
    mode: config.common.format.channels == 2 ? lame.STEREO : lame.MONO
});

//-- To connect lossless recording
//  TODO: save to .wav instead of .raw
const audioJack = new Transform({
    transform: (data, _, done) => done(null, data)
});

//-- Output streams named "reels" to differentiate from streamer
let outputReel = [],
    activeReel = 0,
    switchReel = () => activeReel = activeReel ? 0 : 1;

const leadZero = num => (num < 10 ? '0' : '') + num;

const startRecording = function(filename) {
    if (!filename) {
        const date = new Date();
        filename = `${date.getFullYear()}-${leadZero(date.getMonth() + 1)}-${leadZero(date.getDate())}_${leadZero(date.getHours())}-${leadZero(date.getMinutes())}`;
    }

    outputReel[activeReel] = fs.WriteStream(`${config.recorder.output.directory}/${filename}.${config.recorder.format.lossless ? 'raw' : 'mp3'}`);
    (config.recorder.format.lossless ? audioJack : encoder).pipe(outputReel[activeReel]);
    console.info(`[ REC ] Start: recording "${filename}" on reel ${activeReel + 1}`);
}

const stopRecording = function() {
    if (outputReel[activeReel]) {
        outputReel[activeReel].end();
        outputReel[activeReel] = null;
        console.info(`[ REC ] Stop: finished recording on reel ${activeReel + 1}`);
    }
}

const cleanFolder = () => cleanup(config.recorder.output.directory, config.recorder.output.keepFor);

const schedule = function(minsPast, bleed) {
    const minsToMs = mins => mins * 60000;

    for (let hour = 0; hour < 24; hour++) {
        for (const mins of minsPast) {
            const triggerTime = `${leadZero(hour)}:${leadZero(mins)}`;
            let startTime   = triggerTime,
                endTime     = triggerTime;
            if (bleed) {
                const triggerDate = new Date();
                triggerDate.setHours(hour);
                triggerDate.setMinutes(mins);
                triggerDate.setSeconds(0);

                let startDate   = new Date(triggerDate.getTime() - minsToMs(bleed)),
                    endDate     = new Date(triggerDate.getTime() + minsToMs(bleed));

                    startTime   = `${leadZero(startDate.getHours())}:${leadZero(startDate.getMinutes())}`;
                    endTime     = `${leadZero(endDate.getHours())}:${leadZero(endDate.getMinutes())}`;
            }

            //  TODO: add bleed
            clock.on(startTime, () => {
                const date = new Date();
                startRecording(
                    /* label the recording with the time it is set to trigger, instead of 
                     * the time it starts recording; this accounts for bleed time */
                    `${date.getFullYear()}-${leadZero(date.getMonth() + 1)}-${leadZero(date.getDate())}_${leadZero(hour)}-${leadZero(mins)}`
                );
                switchReel();
            });

            clock.on(endTime, () => {
                stopRecording();
                cleanFolder();
            });
        }
    }
};

const run = function() {
    //  check output folder exists
    if (!fs.existsSync(config.recorder.output.directory)) {
        try {
            fs.mkdirSync(config.recorder.output.directory);
        } catch(err) {
            console.error(`[ REC ] Error: ${err}`);
        }
    }

    schedule(config.recorder.minsPast, config.recorder.bleed);

    console.info('[ REC ] Initialised');
    startRecording(outputReel[activeReel]);
    switchReel();
};

exports.input   = config.recorder.format.lossless ? audioJack : encoder;
exports.run     = run;
