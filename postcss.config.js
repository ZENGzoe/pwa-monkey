var autoprefixer = require('autoprefixer');

module.exports = {
    plugins : [
        autoprefixer({
            browsers : [
                'Android >= 4.0',
                'ios >= 6',
                'last 5 QQAndroid versions',
                'last 5 UCAndroid versions'
            ],
            cascade : true
        })
    ]
}