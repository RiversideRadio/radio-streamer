//-- Includes
const nodeshout = require('nodeshout'),
    ShoutStream = nodeshout.ShoutStream,
    mic = require('mic'),
    lame = require('lame'),
    config = require('./config.json');


//-- Shout setup
nodeshout.init();
var shout = nodeshout.create();

shout.setName(config.stream.metadata.name);
shout.setDescription(config.stream.metadata.description);
shout.setGenre(config.stream.metadata.genre);
shout.setUrl(config.stream.metadata.url);
shout.setHost(config.stream.server.host);
shout.setPort(config.stream.server.port);
shout.setUser(config.stream.server.user);
shout.setPassword(config.stream.server.password);
shout.setMount(config.stream.server.mount);
shout.setFormat(config.stream.format.mp3); // 0=ogg, 1=mp3
shout.setAudioInfo('bitrate', config.stream.format.bitrate);
shout.setAudioInfo('samplerate', config.stream.format.samplerate);
shout.setAudioInfo('channels', config.stream.format.channels);


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
    console.log('Audio input has gone silent.');
});

micInputStream.on('sound', function() {
    console.log('Audio input is back.');
});


//-- Start streaming
//  Open Shoutcast stream
shout.open();

//  Start recording
micInstance.start();

console.log("Stream started.");