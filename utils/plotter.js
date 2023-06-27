const Canvas = require('@napi-rs/canvas')
const storage = require('./activity-storage.js')

var plotter = {}
plotter.plot = function(options) {
    const canvas = Canvas.createCanvas(1280, 720)
    const ctx = canvas.getContext('2d')

    const guildData = storage.getGuild(options.guild)

    var users = options.users.length ? options.users : guildData.allUsers()
    console.log(users)
// var activity = [[10, 8, 6, 3, 4, 2, 6, 9, 12], [,,,1, 2, 3, 0, 6, 0, 1, 2, 3]];
// var us = [0, 1];

// var colors = [color(176, 106, 32), color(44, 184, 84)];

    // Days since discord epoch
    const today = Math.floor((Date.now() - 1420070400000)/(1000*60*60*24))

    var firstDay = today
    var lastDay = 0
    var maxActivity = 0
    users.forEach(u => {
        Object.entries(guildData.userMessages(u).data).forEach(pair => {
            const d = pair[0].substring(1)
            firstDay = Math.min(d, firstDay)
            lastDay = Math.max(d, lastDay)
            maxActivity = Math.max(maxActivity, pair[1].length)
        })
    })

    const start = options.start > 0 || options.start === 0 ? today - options.start : firstDay
    const end = options.end > 0 || options.end === 0 ? today - options.end : lastDay

    const width = canvas.width
    const height = canvas.height
    const low = height-10
    const high = 10
    const left = 10
    const right = width-10

    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1
    ctx.moveTo(left, 10)
    ctx.lineTo(left, height)
    ctx.moveTo(0, low)
    ctx.lineTo(right, low)
    ctx.stroke()
    ctx.beginPath()

    ctx.lineWidth = 0.5


    users.forEach(u => {
        var prev = 0;
        // TODO: match colors to users
        // TODO: use distinct colors (blue noise)
        var rand = ()=>Math.floor(256*Math.random()).toString('16')
        ctx.beginPath()
        ctx.strokeStyle = '#'+rand()+rand()+rand()
        let msgs = guildData.userMessages(u)
        for(var i = start; i <= end; i++) {
            const now = msgs.onDay(i)
            if(!prev) { prev = now; continue; }
            // console.log('start line', (i-1-start)/(end-start)*(right-left)+left, prev/maxActivity*(high-low)+low)
            if(now) {
                ctx.moveTo((i-1-start)/(end-start)*(right-left)+left, prev/maxActivity*(high-low)+low)
                ctx.lineTo((i-start)/(end-start)*(right-left)+left, now/maxActivity*(high-low)+low)
            } else {
                ctx.moveTo((i-1-start)/(end-start)*(right-left)+left, prev/maxActivity*(high-low)+low);
            }
            ctx.stroke()
            prev = now;
        }
    })

    return canvas.toBuffer('image/png')
}

module.exports = plotter

