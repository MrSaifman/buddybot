//Name: mute.js
//Project: Buddy Bot
//Author: Case Hassak
//Description: Used to mute a user in a discord server. Can mute a user or mute a user for a given time.

const fs = require("fs");

module.exports.run = async (client, message, args) => {
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You do not have permission to mute!"); //Makes sure user has permission to mute.
    //Gets the user to mute
    let toMute = message.guild.member(message.mentions.users.first() || message.guild.member(args[0]));
    if(!toMute) return message.channel.send("You did not specify a user mention!\n!mute [user]\n!mute [user] [time in seconds]\n!mute [user] [time] [minutes|hours|days]");

    //Gets the role to give to the user.
    let role = message.guild.roles.cache.find(r => r.name === "Muted");
    if(toMute.roles.cache.some(role => role.name === "Muted"))  return message.channel.send("This user is already muted!");

    let name; //Variable to hold the name to display in the response message.
    if(!(args[1] === undefined)){
        if(isNaN(parseFloat(parseInt(args[1])))){
            message.channel.send(`Invalid command!\n!mute [user]\n!mute [user] [time in seconds]\n!mute [user] [time] [minutes|hours|days]`);
            return;
        };

        let theTime; //Time in miliseconds to add to the datetime.
        
        //Checks if a user requested a specific time inteveral, then sets the name and time to add.
        if(!(args[2] === undefined)){
            if(args[2].toLowerCase() === "minute" || args[2].toLowerCase() === "minutes" ){
                theTime = parseInt(args[1])*60;
                name = args[2].toLowerCase();
            }else if(args[2].toLowerCase() === "hour" || args[2].toLowerCase() === "hours" ){
                theTime = parseInt(args[1])*3600;
                name = args[2].toLowerCase();
            }else if (args[2].toLowerCase() === "day" || args[2].toLowerCase() === "days" ){
                theTime = parseInt(args[1])*86400;
                name = args[2].toLowerCase();
            }else{
                theTime = parseInt(args[1]);
                name = "seconds";
            };
        }else{
            theTime = parseInt(args[1]);
            name = "seconds";
        };

        client.mutes[toMute.id] = {
            guild: message.guild.id,
            time: Date.now() + theTime * 1000 //Converts to miliseconds
        };

        //Writes user to the mutes.json file
        fs.writeFileSync("./mutes.json", JSON.stringify(client.mutes, null, 4), error => {
            if(error) throw error;
            
        });
        message.channel.send(`I have muted ${toMute} for ${args[1]} ${name}!`);
    } else {
        message.channel.send(`I have muted ${toMute}!`);
    };
    
    await toMute.roles.add(role);
    return;
};