const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./workspace-db/ws.db');

let p = db.prepare("SELECT sql FROM sqlite_master WHERE tbl_name = 'student' AND type = 'table'");

p.all((a, b)=>console.log(a, b))