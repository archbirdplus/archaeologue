# Archaeologue

Archaeologue is a discord bot that downloads all the messages in a discord server and plots users' activity (messages per day) over time.

## Commands 

`/help` - List the bot's commands

`/update` - Update the bot's internal cache of users' messages

`/plot` - Reply with an image plotting the activity on the server over time

The files will be stored under the `data/` directory. See `data/README.md` for the file format.

## Running yourself

Create the `config.json` based on the `config.json.template` file using your own discord bot user.

Then run the following command to register slash commands with discord:

```
node deploy-commands
```

To invite the bot to a server, use the OAuth2 URL Generator to create invite link for the bot. The following permissions are necessary:

Scopes:
* bot
* applications.commands

Bot permissions:
* Send Messages
* Read Message History
* Slash commands

No "Privileged Gateway Intents" are required, and "Message Content Intent" may cause wasted bandwidth anyways.

To start up the bot once it's set up, simply run:

```
node .
```

## Help me please

I don't know how to stop the bot from downloading the message contents which I want to minimize anyways...
