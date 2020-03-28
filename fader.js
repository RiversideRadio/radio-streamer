let Gain = require('audio-gain');
// const schedule = require('node-schedule');

Gain.prototype.fadeTo = function(targetVol, duration) {
    const startVol  = this.volume,
          startTime = (new Date()).getTime(),
          endTime   = startTime + duration,
          self      = this;

    console.info(`Fading to ${targetVol}`);
    //  change volume every 50ms until finished
    const interval = 50;
    const rampVol = function() {
        const timeNow = (new Date()).getTime();

        if (timeNow >= endTime) {
            self.setVolume(targetVol);
            console.info('Finished fading');
            return;
        }

        const newVol = targetVol + ( ( ( endTime - timeNow ) / duration ) * ( startVol - targetVol ) );
        
        self.setVolume(newVol);

        //  call next volume change
        setTimeout(rampVol, interval);
    };
    rampVol();
};

module.exports = Gain;