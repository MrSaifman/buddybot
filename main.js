//Name: main.js
//Project: Buddy Bot
//Author: Case Hassak
//Version: 1.0

const Discord = require('discord.js');
const fs = require("fs");
const mysql = require("mysql");

const client = new Discord.Client();
client.commands = new Discord.Collection();

client.mutes = require("./mutes.json");
const config = require('./config.json'); // Do not share json file with others. Token gives attackers easy access!
client.login(config.token);
const prefix = config.prefix;

//Reads files in cmd directory and makes an object containing all the names.
fs.readdir("./cmds/", (error, files) => {
    if(error) console.error(error);
    let jsfiles = files.filter(f => f.split(".").pop() === "js");

    if(jsfiles.length <= (0)){
        console.log("No commands to load!");
        return;
    }
    
    console.log(`Loading ${jsfiles.length} commands!`);
    jsfiles.forEach((f, i) => {
        let props = require(`./cmds/${f}`);
        console.log(`${i + 1}: ${f} loaded!`);
        client.commands.set(f, props); //Puts all the file names into commands object for function calls.
    });
});

client.on("ready", () => {
    console.log(`${client.user.username} is ready!`); 
    console.log(client.commands);
    // For every 5 seconds, checks if a muted user's timer expired. Removes the role and their Id object from the JSON file.
    client.setInterval(() => {
        for(let i in client.mutes){
            let time = client.mutes[i].time;
            let guildId = client.mutes[i].guild;
            let guild = client.guilds.cache.get(guildId);
            let mutedRole = guild.roles.cache.find(r => r.name === "Muted");
            let member = guild.members.cache.get(i);
            if(!mutedRole) continue;

            if(Date.now() > time){
                console.log(`${i} is now unmuted!`)
                member.roles.remove(mutedRole);
                delete client.mutes[i];

                fs.writeFileSync("./mutes.json", JSON.stringify(client.mutes, null, 4), error => {
                    if(error) throw error;
                });
            };
        };
    }, 5000);
});

function generateXp() {
    let min = 20;
    let max = 30;
    return Math.floor(Math.random() * (max-min+1)) + min;
}

client.on("message", async message => {
    if(message.author.bot) return; //Prevents bots from sending messages.
    if(message.channel.type === "dm") return; //Prevents users from direct messaging the bot.

    con.query(`SELECT * FROM xp WHERE id = ${message.author.id}`, (error, rows)=>{
        if(error) throw error;
        
        if(rows.length < 1){
            sql = `INSERT INTO xp (id, xp) VALUES ('${message.author.id}',${generateXp()})`;
        } else {
            let xp = rows[0].xp;
            sql = `UPDATE xp SET xp = ${xp + generateXp()} WHERE id = '${message.author.id}'`;

        }
        con.query(sql);
        console.log(rows);
    });
    let messageArray = message.content.split(" ");
    let command = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);

    if(!command.startsWith(prefix)) return; //checks if user typed the prefix to command the bot.
    let filename = command.slice(prefix.length).concat(".js");
   
    if(client.commands.has(filename)){
        let cmd = client.commands.get(filename);
        cmd.run(client, message, args, con);
    };
});

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "sadb"
});

con.connect(error => {
    if(error) throw error;
    console.log("Database connected!");
    con.query("SHOW TABLES", console.log);
});