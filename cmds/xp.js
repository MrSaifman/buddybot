

module.exports.run = async (client, message, args, con) => {
    // let target = message.mentions.users.first() || message.guild.members.fetch(args[1]) || message.author;

    
    let target = message.author.id;
    con.query(`SELECT * FROM xp WHERE id = ${target}`, (error, rows)=>{
        if(error) throw error;
        return message.channel.send(rows[0].xp);
    });
}
