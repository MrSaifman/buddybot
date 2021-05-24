//Name: main.js
//Project: Buddy Bot
//Author: Case Hassak
//Version: 1.1

const Discord = require('discord.js');
const fs = require("fs");
const mysql = require("mysql");

const client = new Discord.Client();
client.commands = new Discord.Collection();

client.mutes = require("./mutes.json"); //Keeps tracks of users muted in case bot goes down. 
const config = require('./config.json'); //Do not share json file with others. Token gives attackers easy access!
client.login(config.token);
const prefix = config.prefix;

//Reads files in cmd directory and makes an object containing all the names.
fs.readdir("./cmds/", (error, files) => {
    if(error) console.error(error);
    let jsfiles = files.filter(f => f.split(".").pop() === "js");

    if(jsfiles.length <= (0)) return console.log("No commands to load!");
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

    //For every 5 seconds, checks the number of users in the server that are not bots. Then it updates the top channel with the user count.
    client.setInterval(() => {
        let guild = client.guilds.cache.get('265317956446191617');
        let numberUsers = guild.members.cache.filter(member => !member.user.bot).size; // Issue: After restarting the server, Getting number of users stuck pending and doesnt update users. Need to fix.
        let channel = guild.channels.cache.get("843048799953879041");
        channel.setName(`Buddies: ${numberUsers}`);
    }, 5000);      
});

client.on('guildMemberAdd', member => {
    //When a user joins a server, checks if the user's information is in the database, otherwise creates a new entry for them.
    con.query(`SELECT * FROM users WHERE id = ${member.user.id}`, (error, rows)=>{
        if(error) throw error;
        
        if(rows.length < 1){
            con.query(`INSERT INTO users (id, username, joined, xp, money) VALUES ('${member.user.id}','${member.user.username}','${date()}',0,0)`);
        } 
        
    });
});

//Generates XP for user between the min and max
function generateXp() {
    let min = 20;
    let max = 30;
    return Math.floor(Math.random() * (max-min+1)) + min;
}

//Gets today's date and puts it in date format for SQL entry
function date(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    if(dd<10) dd='0'+dd;
    if(mm<10) mm='0'+mm;
    return today = yyyy+'-'+mm+'-'+dd;
}

client.on('guildMemberUpdate', (oldMember, newMember) => {
    //Updates the users nickname on their SQL entry if the server see's a change in their nickname.
    if(newMember.nickname && oldMember.nickname !== newMember.nickname) {    
        con.query(`SELECT * FROM users WHERE id = ${newMember.id}`, (error, rows)=>{
            if(error) throw error;
            sql = `UPDATE users SET nickname = '${newMember.nickname}' WHERE id = '${newMember.id}'`;
            con.query(sql);
        });
    }
 });

client.on("message", async message => {
    if(message.author.bot) return; //Prevents bots from sending messages.
    if(message.channel.type === "dm") return; //Prevents users from direct messaging the bot.

    //In case the bot is down when a user joins, it will add a SQL entry for them. If not it will 
    con.query(`SELECT * FROM users WHERE id = ${message.author.id}`, (error, rows)=>{
        if(error) throw error;
        if(rows.length < 1){
            if(message.member.nickname !== undefined){
                sql = `INSERT INTO users (id, username, nickname, joined, xp, money) VALUES ('${message.author.id}','${message.author.username}','${message.member.nickname}','${date()}',0,0)`;
            }else{
                sql = `INSERT INTO users (id, username, joined, xp, money) VALUES ('${message.author.id}','${message.author.username}','${date()}',0,0)`;
            }
        } else {
            let xp = rows[0].xp;
            let money = rows[0].money;
            sql = `UPDATE users SET xp = ${xp + generateXp()}, money = ${money + 1} WHERE id = '${message.author.id}'`;

        }
        con.query(sql);
    });
    
    //Converts a users message to command and arguments to use in commands. 
    let messageArray = message.content.split(" ");
    let command = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);

    if(!command.startsWith(prefix)) return; //checks if user typed the prefix to command the bot.
    let filename = command.slice(prefix.length).concat(".js");
   
    if(client.commands.has(filename)){
        let cmd = client.commands.get(filename);
        cmd.run(client, message, args, con);
    }
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
});