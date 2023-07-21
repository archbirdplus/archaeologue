const Canvas = require('@napi-rs/canvas')
const storage = require('./activity-storage.js')

var plotter = {}
plotter.plot = async function(options) {
    const canvas = Canvas.createCanvas(500, 300)
    const ctx = canvas.getContext('2d')

    const guildData = storage.getGuild(options.guild.id)

    var users = options.users.length ? options.users : guildData.allUsers()
    // TODO: cache this username fetch, only update with /update
    let userNames = await options.guild.members.fetch({ user: users })
        .then(usrs =>
            usrs.map(usr => [usr.user.id, usr.nickname ?? usr.user.username ?? "sussy baka"])
        )
        .then(us => us.reduce((r, p) => (r[p[0]] = p[1], r), []))

    // Days since discord epoch
    const today = Math.floor((Date.now() - 1420070400000)/(1000*60*60*24))

    var firstDay = today
    var lastDay = 0
    var maxActivity = 0
    var totalActivity = []
    users.forEach(u => {
        var activity = 0
        Object.entries(guildData.userMessages(u).data).forEach(pair => {
            const d = pair[0].substring(1)
            firstDay = Math.min(d, firstDay)
            lastDay = Math.max(d, lastDay)
            maxActivity = Math.max(maxActivity, pair[1].length)
            activity += pair[1].length
        })
        totalActivity[u] = activity
    })
    users.sort((a, b) => totalActivity[b] - totalActivity[a])

    console.log("plotting", users)

    const start = options.start > 0 || options.start === 0 ? Math.max(0, today - options.start) : firstDay
    const end = options.end > 0 || options.end === 0 ? Math.min(today, today - options.end) : lastDay

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

    ctx.lineWidth = 1
    ctx.textAlign = "left"

    var legends = 0 // users who got on the legend list

    users.forEach(u => {
        var prev = 0;
        // TODO: match colors to users
        // TODO: use distinct colors (blue noise)
        var rand = ()=>Math.floor(256*Math.random()).toString('16')
        ctx.beginPath()
        ctx.strokeStyle = '#'+rand()+rand()+rand()
        if(20 + legends * 20 < height) {
            // counterclockwise because discordjs did it
            ctx.fillStyle = ctx.strokeStyle
            ctx.arc(left + 20, 20 + legends*20, 5, 0, Math.PI*2, true)
            ctx.font = '12px sans-serif'
            ctx.fillText(userNames[u] ?? `non existent ${u}`, left + 20 + 10, 20 + legends*20 + 3)
            ctx.fill()
            legends++
        }
        let msgs = guildData.userMessages(u)
        for(var i = start; i <= end; i++) {
            const now = msgs.onDay(i)
            if(!prev) { prev = now; continue; }
            if(now) {
                ctx.moveTo((i-1-start)/(end-start)*(right-left)+left, prev/maxActivity*(high-low)+low)
                ctx.lineTo((i-start)/(end-start)*(right-left)+left, now/maxActivity*(high-low)+low)
            } else {
                ctx.moveTo((i-1-start)/(end-start)*(right-left)+left, prev/maxActivity*(high-low)+low);
            }
            prev = now;
        }
        ctx.stroke()
    })

    return canvas.toBuffer('image/png')
}

module.exports = plotter

