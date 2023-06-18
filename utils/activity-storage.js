
const fs = require('node:fs')
const path = require('node:path')

const storage = {
    dir: path.join(appRoot, 'data'),
    cache: {},
    load(guild) {
        const contents = require(path.join(this.dir, guild+'.json'))
        cache[guild] = contents
    },
    save(guild, user, snowflake) {
        if(!cache[guild]) { load(guild) }
        if(!cache[guild][user]) { cache[guild][user] = [] }
        const day = getDay(snowflake)
        if(!cache[guild][user][day]) { cache[guild][user][day] = [] }
        if(!cache[guild][user][day].includes(snowflake)) {
            cache[guild][user][day].push(snowflake)
            cache[guild][user].lastDay = Math.max(cache[guild][user].lastDay, day)
            return true
        }
        return false
    },
    userHistory(guild, user) {
        if(!cache[guild]) { load(guild) }
        const hist = cache[guild][user]
        if(!hist) { return [] }
        return Object.keys(hist).reduce((r, day) => {
            r[day] = hist[day].length
        }, {})
    },
    write() {
        Object.keys(cache).forEach(key => {
            fs.writeFileSync(
                path.join(this.dir, key+'.json'),
                JSON.stringify(cache[key])
            )
        })
    }
}

module.exports = storage

