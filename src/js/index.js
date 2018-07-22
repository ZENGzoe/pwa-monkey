require('../css/package.scss');
// require('../css/style.scss');
require('./play.js');

// const format = require('utils/format');

if('serviceWorker' in navigator){
    window.addEventListener('load',() => {
        navigator.serviceWorker.register('./service-worker.js' , { scope : './'})
            .then(registration => {
                console.log('serviceworker registration successful with scope:' , registration.scope);
            })
            .catch(err => {
                console.log('serviceWorker registration failed:' , err)
            })
    })
}




