const Discord = require('discord.js');
const client = new Discord.Client();

// Do not share json file with others. Token gives attackers easy access!
const config = require('./config.json');
const prefix = config.prefix;

client.login(config.token);

client.on("ready", () => {
    console.log(`${client.user.username} is ready!`);
});

client.on("message", async message => {
    if(message.author.bot) return; //Prevents bots from sending messages
    if(message.channel.type === "dm") return; //Prevents users from direct messaging the bot

    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    let args = messageArray.slice(1);

    if(!command.startsWith(prefix)) return;

    if(command === `${prefix}userinfo`){
        let embed = new Discord.MessageEmbed()
            .setAuthor(message.author.username)
            .setDescription("this is the users info!");

            message.channel.send(embed);
            return;
    };
});


