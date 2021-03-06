# Radio Streamer
This is a node interface between a radio station's audio output and an [Icecast](https://icecast.org/) server. In our case, the streamer receives audio from [Myriad Playout](https://www.broadcastradio.com/myriad-playout) and sends it to our Icecast hosting service. 

## Features
* Streams audio input to Icecast
* Records input in a similar fashion to [PlayIt Recorder](https://www.playitsoftware.com/Products/Recorder) or [Rotter](https://github.com/njh/rotter)
* Sends email notifications when audio input falls silent
* TODO: Switch to an emergency broadcast when audio input falls silent

## Installation
Clone the repository, then install the dependencies:
```shell
$ apt install icecast2 libshout3 libshout3-dev libasound2-dev
$ npm install
```

Create `config.json` from template:
```shell
$ cp config.template.json config.json
```

## Running stream as a process
You can keep the stream running as a process using PM2:
```shell
$ npm install pm2 -g
$ pm2 start ./index.js -n stream
```

You can then set it to [run on startup](https://pm2.keymetrics.io/docs/usage/startup/).

## Known faults
Conflicting `libssl1.0-dev` and `libssl-dev` packages mean that NPM and `libshout3-dev` cannot be installed at the same time ([see bug](https://bugs.launchpad.net/ubuntu/+source/nodejs/+bug/1794589)).

A workaround is to downgrade Node.js:
```shell
$ apt install nodejs=8.10.0~dfsg-2ubuntu0.2 nodejs-dev=8.10.0~dfsg-2ubuntu0.2 npm libshout3-dev
```
