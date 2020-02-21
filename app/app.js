const scraper = require('./scraper');
const notifier = require('node-notifier');
const path = require('path');
require('dotenv').config();

// use the scraper module to login to the visiontime page
// and scrape the details

// load config from .env
var configuration = {
    badge: process.env.BADGE,
    pin: process.env.PIN,
    interval: process.env.INTERVAL,
    url: process.env.URL,
    hourStart: process.env.HOUR_START,
    hourEnd: process.env.HOUR_END
};

// send config to scheduler
schedule(configuration);

// scheduler, check every config.interval minutes
function schedule(config) {
    checkVisionTime(config)
        .then(() => {
            console.log(`Waiting ${config.interval} minutes`);
            setTimeout(() => {
                schedule(config);
            }, 1000 * 60 * config.interval)
        })
        .catch(err => console.error('error in scheduler', err));
};

// scrape status and do 'stuff' with it.
async function checkVisionTime(config) {

    var hour = new Date().getHours();

    // if we're in normal hours
    if (hour >= config.hourStart && hour <= config.hourEnd) {
        scraper.getStatus({ badge: config.badge, pin: config.pin }, config.url)
            .then(data => {
                const status = {};
                // extract the status

                // TODO: use more appropriate method
                data.map(e => {
                    if (e === 'Clocked In') {
                        status.loggedIn = true;
                    } else if (e === 'Clocked Out') {
                        status.loggedIn = false;
                    }
                })

                // act on the status

                if (status.loggedIn) {
                    // TODO: turn tray icon green
                    console.log('You are logged in.')
                } else {
                    //TODO: turn tray icon red
                    notifier.notify({
                        title: 'VisionTime Alert',
                        message: 'You are not signed in!',
                        icon: path.join(__dirname, '../icons/alert.png'),
                        sound: true
                    })
                }
            })
            .catch(err => {
                console.log('there was an error!: ' + err);
                notifier.notify({
                    title: 'Oops! Something went awry',
                    message: 'Error: ' + err
                });
                throw err;
            });

    } else {
        console.log(`Outside hours:  
                    This Hour: ${hour}  
                    Start hour: ${config.hourStart}
                    End hour: ${config.hourEnd}`);
    }

}


