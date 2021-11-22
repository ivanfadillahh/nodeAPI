// import library
const express = require('express');
const bodyParser = require('body-parser');
const Crypto = require('crypto');
const mysql = require('mysql');
const md5 = require('md5');
const { application } = require('express');

// connection
const pool = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "nodejs"
});

// init
const port = 3000;
const app = express();
app.use(bodyParser.json());

app.listen(port, () => {
    console.log("Server running on port : " + port);
});

function randomString(size = 21){
    return Crypto
    .randomBytes(size)
    .toString('base64')
    .slice(0,size)
}

// api auth
app.post("/api/v1/auth", (req,res) => {
    let body = req.body;

    let email = body["email"];
    let pass = body["pass"];
    let new_pass = md5(pass);

    let err_db = {
        "message": "Connection fail!"
    }

    pool.getConnection((err,conn) => {
        if(err){
            res.status(500).send(err_db);
        }
        else{
            let empty = {
                "code": 0,
                "message": "User not found!"
            }

            let query = 'select id,name,email,role,date_created,last_login,token from users where email="' + email + '" and password="' + md5(pass) + '"';

            let randStr = randomString();
            let upd_query = `update users set token='${randStr}' where email='${email}' and password='${new_pass}'`;

            conn.query(upd_query, (error,results) => {
                conn.release();

                if(error || results == ""){
                    res.status(400).send(empty);
                }
                else{
                    pool.getConnection((ers,conns) => {
                        if(ers){
                            res.status(500).send(err_db);
                        }
                        else{
                            conns.query(query,(erss,resz) => {
                                if(erss || resz == ""){
                                    res.status(400).send(empty);
                                }
                                else{
                                    Object.keys(resz).forEach(function(key) {
                                        var row = resz[key];
                                        let arr = {
                                            "code": 1,
                                            "message": "Authentication success",
                                            "data": row
                                        }
                                        res.status(200).send(arr);
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

// api logout
app.post("/api/v1/logout", (req,res) => {
    let header = req.header("token");
    let err_db = {
        "message": "Connection fail!"
    }
    let err_upd_logout = {
        "code": -1,
        "message": "Error update users logout!"
    }
    let succ_upd_logout = {
        "code": 1,
        "message": "Logout success"
    }

    let date = new Date();
    let query = `UPDATE users SET token = null, last_login= ? WHERE token = ?`;
    let data = [date, header];

    pool.getConnection((err,conn) => {
        if(err){
            res.status(500).send(err_db);
        }
        
        conn.query(query, data, (error, results) => {
            conn.release();

            if(error || results == "" || results.affectedRows == 0){
                res.status(400).send(err_upd_logout);
            }
            else{
                res.status(200).send(succ_upd_logout);
            }
        });

    });
});

// api create user
app.post("/api/v1/create/user", (req, res) => {
    let header = req.header("token");

    let body = req.body;
    let password = body["password"];
    let en_pass = md5(password);

    let err_db = {
        "message": "Connection fail!"
    }
    let err_user = {
        "message": "You do not have permission for this!"
    }
    let no_user = {
        "message": "Token user not found!"
    }

    pool.getConnection((err,conn) => {
        if(err){
            res.status(500).send(err_db);
        }

        let query = `select role from users where token='${header}'`;

        conn.query(query, (error, results) => {
            conn.release();

            if(error || results == ""){
                res.status(400).send(no_user);
            }
            else{
                Object.keys(results).forEach(function(key) {
                    var row = results[key];
                    if(row.role == 1)
                    {
                        pool.getConnection((errs, conns) => {
                            if(errs){
                                res.status(500).send(err_db);
                            }

                            let input = {
                                "name": body["name"],
                                "email": body["email"],
                                "password": en_pass,
                                "role": 2,
                                "last_login": null
                            }

                            let err_in_user = {
                                "code": -1,
                                "message": "Error created new user"
                            }

                            conns.query("insert into users set?", input, (errors, result) => {
                                conns.release();
                                if(errors){
                                    res.status(201).send(err_in_user);
                                }
                                else{
                                    let suc_in_user = {
                                        "code": 1,
                                        "message": "Success created new user"
                                    }
                
                                    res.status(200).send(suc_in_user);
                                }
                            });
                        });
                    }
                    else{
                        res.status(400).send(err_user);
                    }
                });
            }
        });
    });
});

// api delete user with auth token admin
app.delete("/api/v1/delete_user/:id", (req, res) => {
    let header = req.header("token");
    let userid = req.params['id'];
    
    let err_con = {
        "code": 500,
        "msg": "Error database connection!"
    };
    let err_token = {
        "code": 404,
        "msg": "Token not found!"
    };
    let err_del = {
        "code": 400,
        "msg": "Error deleting user!"
    };
    let succ_del = {
        "code": 200,
        "msg": "Success deleting user"
    };
    let adm_pls = {
        "code": 400,
        "msg": "Need administrator access!"
    }

    pool.getConnection((err, conn) => {
        if(err){
            res.status(500).send(err_con);
        }

        let queryt = `select role from users where token='${header}'`;

        conn.query(queryt, (error, results) => {
            conn.release();

            if(error || results == ""){
                res.status(404).send(err_token);
            }
            else{
                Object.keys(results).forEach(function(key) {
                    var row = results[key];
                    if(row.role == 1){
                        pool.getConnection((ers, cons) => {
                            if(ers){
                                res.status(500).send(err_con);
                            }

                            let query = `delete from users where id=${userid}`;

                            cons.query(query, (erss, resz) => {
                                cons.release();

                                if(erss || resz == ""){
                                    res.status(400).send(err_del);
                                }
                                res.status(200).send(succ_del);
                            });

                        });
                    }
                    else{
                        res.status(400).send(adm_pls);
                    }
                });
            }
        });
    });
});

// api update user with token admin
app.patch("/api/v1/update_user/:id", (req,res) => {
    let header = req.header("token");
    let userid = req.params['id'];

    let body = req.body;
    let name = body["name"];
    let email = body["email"];

    let err_db = {
        "code": 500,
        "msg": "Connection fail!"
    }
    let err_nofound = {
        "code": 404,
        "msg": "Token not found!"
    }
    let err_adm = {
        "code": 400,
        "msg": "Need administrator access!"
    }
    let err_up_usr = {
        "code": 400,
        "msg": "Error updating user"
    }
    let succ_up_usr = {
        "code": 200,
        "msg": "Success updating user"
    }

    pool.getConnection((error, connection) =>{
        if(error){
            res.status(500).send(err_db);
        }

        let queryadm = `select role from users where token='${header}'`;

        connection.query(queryadm, (err, result) =>{
            connection.release();

            if(err || result == ""){
                res.status(404).send(err_nofound);
            }
            else{
                Object.keys(result).forEach(function(key) {
                    var rows = result[key];
                    if(rows.role == 1){
                        pool.getConnection((errs, conn) => {
                            if(errs){
                                res.status(500).send(err_db);
                            }

                            let query = `update users set name='${name}',email='${email}' where id='${userid}'`;

                            conn.query(query, (ers, results) => {
                                conn.release();

                                if(ers || results == ""){
                                    res.status(400).send(err_up_usr);
                                }
                                res.status(200).send(succ_up_usr);
                            })
                        });
                    }
                    else{
                        res.status(400).send(err_adm);
                    }
                });
            }
        });
    });

});