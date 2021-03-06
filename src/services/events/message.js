const Discord = require('discord.js');
const fs = require('fs');

//Custom Modules
const mh = require('../moduleHandler');

//Server Management
const sm = require('../serverManager');

module.exports = message => {

    const client = message.client;
    
    const config = JSON.parse(fs.readFileSync('config.json'));
    
    /* Cut Out White Space In The Message */
    message.content = message.content.trim();

    // info(message.content)

    /* If The Message Author Is A Bot Or Sends An Embed Ignore It */
    if(message.author.bot || !message.content) return;
    
    /* If Someone Tags The Bot Give Them Some Help */
    if(message.content == `<@!${client.user.id}>`) send(createEmbed(`Hello ${message.member.displayName}! If you need any help, run \`${config.prefix}help\``), 10)

    /* Debug Only */
    // message.channel.createInvite({unique: true}).then(invite => {
    //     info(`[${message.author.username} | ${message.guild.name} : ${message.channel.name} (${invite})]: ${message.content}`);
    // })

    /* If Someone Dosen't Use The Prefix, Ignore it */
    if(!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).split(' ');
    const command = args.shift().toLowerCase();

    try {
        
        //Dm commands like login, suppress perm etc
        if(message.guild == null) {
            
            if(command == "suppressperm") {

                if(config.suppress.indexOf(message.author.id) > -1) return send(createEmbed(`You're already on the supress list!\nUse \`${config.prefix}unsuppressperm\` to re-enable.`));

                config.suppress.push(message.author.id);
                fs.writeFileSync('config.json', JSON.stringify(config, null, 4));
            
                info(`Added ${message.author.id} to the permission suppress list`);
                return send(createEmbed(`I'll no longer bug you with permission error DM's\nP.S use \`${config.prefix}unsuppressperm\` to re-enable.`), 120);
            }

            if(command == "unsuppressperm") {
                
                var userIndex = config.suppress.indexOf(message.author.id);
                if(userIndex < 0) return send(createEmbed("Sorry, you're not currently in the suppress list!"));

                warn(userIndex);

                var suppress = config.suppress;

                fs.writeFileSync('config.json', JSON.stringify(config, null, 4));
            
                info(`Removed ${message.author.id} from the permission suppress list`);
                return send(createEmbed("I'll continue to send you DM's if my permissions are messed up!"), 120);
            }

            return send(createEmbed("Sorry, DM Commands aren't supported."));

        }


        //Custom modules
        var module = mh.getModuleFromCommand(command);
        if(module) {
            return require(`../../../modules${module.target}`).trigger(message, command, args);
        }

        if(!fs.existsSync(`./src/services/commands/${command}.js`)) return;
        let commandFile = require(`../commands/${command}`);
        
        if(!message.guild.me.permissions.has(['SEND_MESSAGES'])) {
            if(config.suppress.indexOf(message.author.id) > -1) return;           
            sm.sendModMessage(guild, message.guild.id, createEmbed(`Sorry to bother you, but I don't have the permission \`SEND_MESSAGES\`, in some channels, which is preventing me from running correcly!\n\n*p.s, to disable this message, reply with \`${config.prefix}suppressperm\``))
        } else {
            commandFile.run(client, message, args, send, createEmbed, config, fs, Discord);
        }
        
    } catch (err) {error(`Error running command  '${command}: \n' ${err.stack}`);}

    function send(text, timeout) {
        if(!timeout && timeout != 0) timeout = 5000;
        else timeout = timeout * 1000;

        message.channel.send(text).then(message => {
            if(timeout == 0) return;
            setTimeout(() => {
                if(message) message.delete();
            }, timeout); 
        }); 
    }

    function createEmbed(title, fields, description, author) {
        const embed = new Discord.RichEmbed()
            .setColor(config.colour)
            .setTitle(title);

        if(!author) embed.setAuthor(client.user.username, client.user.avatarURL);
        else embed.setAuthor(author, client.user.avatarURL);

        if(description) embed.setDescription(description)
    
        if(fields) for(var i in fields) embed.addField(fields[i].title, fields[i].data);
        return(embed);
    
    }

}