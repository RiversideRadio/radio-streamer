# Radio Server
This is a node interface between a radio station's audio output and an [Icecast](https://icecast.org/) server. In our case, the server receives audio from [Myriad Playout](https://www.broadcastradio.com/myriad-playout) and streams it to our [Shoutcast](https://www.shoutcast.com/) hosting service. 

It includes provisions to notify technicians of downtime and to switch to an emergency broadcast recording in the event Myriad Playout goes silent.

## Installation
Clone the repository, then install the dependencies:
```shell
$ npm install alsa-capture --save
```
