
const fs = require('node:fs')
const path = require('node:path')

/* storage object tree =
    base {
        getGuild guild -> GuildData {
            userMessages user -> UserMessages {
                onDay day -> count
                push snowflake => <updates>
            }
            channelRecency channel -> timestamp
            pushUserMessage user snowflake -> <updates>
        }
        write => <save file>
    }
*/

class UserMessages {
    data;
    constructor(obj) {
        this.data = obj ?? {}
    }
    onDay(day) {
        return this.data['d'+day]?.length ?? 0
    }
    push(snowflake) {
        const day = 'd'+getDay(snowflake)
        if(!this.data[day]) { this.data[day] = {} }
        if(this.data[day].includes(snowflake)) { return false }
        this.data[day].push(snowflake)
        return true
    }
}

class GuildData {
    data;
    cache;
    constructor(obj) {
        this.data = obj
    }
    channelRecency(channel) {
        return this.data['#'+channel]?.recency
    }
    userMessages(user) {
        const key = '@'+user
        if(!this.cache[key]) {
            this.cache[key] = new UserMessages(this.data['@'+user])
        }
        return this.cache[key]
    }
    pushMessage(user, channel, snowflake) {
        this.userMessages(user).push(snowflake)
    }
}

const base = {
    dir: path.join(appRoot, 'data')
    cache: {},
    data: {},
    getGuild(guild) {
        const key = '#'+guild
        if(!this.cache[key]) {
            this.data[key] = require(path.join(this.dir, guild+'.json'))
            this.cache[key] = new GuildData(this.data[key])
        }
        return this.cache[key]
    },
    write() {
        Object.keys(this.cache).forEach(key => {
            fs.writeFileSync(
                path.join(this.dir, guild+'.json'),
                JSON.stringify(cache)
            )
        })
    }
}

module.exports = base

