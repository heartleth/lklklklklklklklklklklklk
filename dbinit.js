const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('C:\\Users\\myjmy\\AppData\\Roaming\\yghdatas\\workspace-db\\ws.db');

// let p = db.prepare("SELECT sql FROM sqlite_master WHERE tbl_name = 'student' AND type = 'table'");
// p.all((a, b)=>{
//     const tnl = 'student'.length;
//     console.log([...b[0].sql.substring(15 + tnl).split(',')].map(e=>e.trim().split(' ')));
// });

db.run('CREATE TABLE posts (id INTEGER PRIMARY KEY AUTOINCREMENT,content text,vote int)', (a, b)=>console.log(a, b));