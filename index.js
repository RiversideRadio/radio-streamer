//-- Includes
const nodeshout = require('nodeshout'),
    ShoutStream = nodeshout.ShoutStream,
    mic = require('mic'),
    lame = require('lame');


//-- Shout setup
nodeshout.init();
var shout = nodeshout.create();

shout.setName('Riverside Radio');
shout.setDescription('Switch On SW London');
shout.setGenre('Variety');
shout.setUrl('http://www.riversideradio.com/');
shout.setHost('localhost');
shout.setPort(8000);
shout.setUser('source');
shout.setPassword('dontpanic');
shout.setMount('stream');
shout.setFormat(1); // 0=ogg, 1=mp3
shout.setAudioInfo('bitrate', '192');
shout.setAudioInfo('samplerate', '44100');
shout.setAudioInfo('channels', '2');


//-- Microphone setup
var micInstance = mic({
    device: 'hw:0,0',
    rate: '44100',
    channels: '2',
    debug: false,
    exitOnSilence: 325 // about 30s (1 frame ≈ 93ms)
});

//-- Encoder setup
var encoder = new lame.Encoder({
    // input
    channels: 2,
    bitDepth: 16,
    sampleRate: 44100,

    // output
    bitRate: 192,
    outSampleRate: 44100,
    mode: lame.STEREO
});


//-- Routing
//  Pipe microphone into Lame
var micInputStream = micInstance.getAudioStream();
micInputStream.pipe(encoder);

//  Pipe encoded audio to Shoutcast
var shoutStream = encoder.pipe(new ShoutStream(shout));


//-- Event handlers
micInputStream.on('error', function(err) {
    cosole.log(`Error in input stream: ${err}`);
});

micInputStream.on('silence', function() {
    console.log('Stream has gone silent.');
});


//-- Start streaming
//  Open Shoutcast stream
shout.open();

//  Start recording
micInstance.start();

console.log("Stream started.");