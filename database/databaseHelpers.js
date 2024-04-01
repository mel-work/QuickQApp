import sqlite3 from "sqlite3";
import { unixToDatetimeFunction, getDaysSinceLastMessage } from '../functions/timeFunctions.js';
import { writeFileSync, readFile } from 'fs';

const DATABASE_PATH = "./QuickQ.db"

var databaseInstance;

let sql;

function openDatabase() {
    if (databaseInstance == null) {
        databaseInstance = new sqlite3.Database(DATABASE_PATH, sqlite3.OPEN_READWRITE, (err) => {
                if (err) return console.error(err.message);
            }
        );
    }
    return databaseInstance;
}

function closeDatabase() {
    if (databaseInstance != null) {
        databaseInstance.close((err) => {
                if (err) return console.error(err.message);
            }
        );
        databaseInstance = null;
    }
}

export async function getAll(query, params = []) {
    let db = openDatabase();

    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            closeDatabase();
            if (err) { reject(err); }
            else { resolve(rows); }
        })
    })    
}

export async function getSingle(query, params = []) {
    let db = openDatabase();

    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            closeDatabase();
            if (err) { reject(err); }
            else { resolve(row); }
        })
    })    
}

export async function runQuery(query, params = []) {
    let db = openDatabase();

    let queryPromise = new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            closeDatabase();
            if (err) { reject(err); }
            else { resolve(true); }
        })
    })

    let success = true;
    queryPromise.then(
        function(value) { /* code if successful */ },
        function(error) { success = false; }
    );
    return success;
}

      // ---------------- INSERT NEW Server INTO DB ------------------
export async function addServer(ownerID, serverID, channelList, membership, inactivityTime, language) {
    let db = openDatabase();
    var today = new Date().toLocaleDateString();
    // today = unixToDatetimeFunction(today)
    sql = `INSERT INTO servers(ownerID, serverID, channels, membership, inactivityTime, channelsLastChanged, language) VALUES (?,?,?,?,?,?,?)`;
    db.run(
        sql,
        [
            ownerID,
            serverID,
            channelList,
            membership,
            inactivityTime,
            today,
			language
        ],
        (err) => {
            if (err) return false;
            else return true;
        }
    );
    closeDatabase();
}

export async function addUser(userID, username, membership, servers) {
    let db = openDatabase();
    // today = unixToDatetimeFunction(today)
    sql = `INSERT INTO users (userID, username, membership, servers) VALUES (?,?,?,?)`;
    db.run(
        sql,
        [
            userID,
            username,
            membership,
            servers
        ],
        (err) => {
            if (err) return false;
            else return true;
        }
    );
	const newUser = new User(userID, username, membership, servers);
  	newUser.saveAsCSV();
    console.log(`User ${userID} added.`)
    closeDatabase();
}

export async function createUser(userID, username, membership, servers){
	var userDict = {"userID" : userID,
            "username": username,
            "membership": membership,
            "servers": servers
	}
	var dictstring = JSON.stringify(userDict);
	writeFileSync("users.json", dictstring);

}

export async function updateUser(userID, username, membership, servers) {
    let db = openDatabase();
    sql = `UPDATE users SET membership = ?, username = ?, servers = ? WHERE userID = ?`;
    db.run(
        sql,
        [
            membership,
            username,
            servers,
            userID,
        ],
        (err) => {
            if (err) return console.log('Error in updateUser');
            else return true;
        }
    );
    closeDatabase();
}

// export async function readUserFile(){
// 	.readFile('users.csv', 'utf8', function (err, data) {
//     /* parse data */
// });
// }
//channelList, serverID, user.membership, server.daysInactive, server.language
export async function updateServer(channelList, serverID, membership, daysInactive, language) {
    let db = openDatabase();
    var today = new Date().toLocaleDateString();
    sql = `UPDATE servers SET channels = ?, channelsLastChanged = ?, membership = ?, inactivityTime = ?, language = ?  WHERE serverID = ?`;
    db.run(
        sql,
        [
            channelList,
            today,
            membership,
            daysInactive,
			language,
            serverID
        ],
        (err) => {
            if (err) return console.log('Error in updateServer');
            else console.log(`Channels for ${serverID} updated.`);
        }
    );
    closeDatabase();
}

export async function deleteUserandServers(userID){
	console.log(typeof userID)
	let db = openDatabase();
	sql = `DELETE FROM users WHERE userID = ?`;
    db.run(
        sql,
        [
            userID
        ],
        (err) => {
            if (err) return console.log('Error in delete User and Servers - users');
            else console.log(`User deleted.`);
        }
    );
	db.run(`DELETE FROM servers WHERE ownerID = ?`,[userID], (err) => {
            if (err) console.log('Error in delete User and Servers - servers');
            else console.log(`Server deleted.`);
        });
	closeDatabase();
}


export async function deleteServer(serverID){
	let db = openDatabase();
	sql = `DELETE FROM servers WHERE serverID = ?`;
    db.run(
        sql,
        [
            serverID
        ],
        (err) => {
            if (err) return console.log(err);
            else console.log(`Server deleted.`);
        }
    );
	closeDatabase();
}

export async function updateChannelsUpdated(ownerID){
	let db = openDatabase();
	var today = new Date();
	let monthPrev =`${today.getMonth()}/${today.getDate()}/${today.getYear()}`
    sql = `UPDATE servers SET channelsLastChanged = ?  WHERE ownerID = ?`;
    db.run(
        sql,
        [
			monthPrev,
            ownerID,
        ],
        (err) => {
            if (err) return console.log(err);
            else return true;
        }
    );
    console.log(`Server date updated.`)
    closeDatabase();
}


export async function updateServerLanguage(serverID, language){
	let db = openDatabase();
    sql = `UPDATE servers SET language = ?  WHERE serverID = ?`;
    db.run(
        sql,
        [
			language,
            serverID,
        ],
        (err) => {
            if (err) return false;
            else console.log(`Language for ${serverID} updated.`);
        }
    );
    closeDatabase();
}

export async function addColumnLanguage(){
	let db = openDatabase();
	sql = `ALTER TABLE servers ADD language string`;
	db.run(sql, [],
        (err) => {
            if (err) return false;
            else console.log(`Language Column Created.`);
        });
	closeDatabase();
}