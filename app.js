// import library express
const express = require('express');

// import library body-parser
const bodyParser = require('body-parser');

// import library mysql
const mysql = require('mysql');

const md5 = require('md5');

// declare connection to mysql
const pool = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "nodejs"
});

const port = 3000;

// create a new Express application
// the object holds the entire API
// we're gonna design
const app = express();

// tranform the request object into json
// useful for handling application/json
// contentTypes in a simpler way
app.use(bodyParser.json());

app.listen(port, () => {
    console.log("Server started to listen on " + port);
});

// endpoint method get
app.get("/api/users", (req, res) => {
    // 1. fetch a connection from pool
    pool.getConnection((err, conn) => {
        if(err) throw err;
        // 2. run the query / command
        conn.query("select * from users", (error, results, fields) => {
            // 3. release the connection
            conn.release();

            if(error) throw error;

            // 4. return the results in response
            // res.send() writes the content to the RESPONSE stream
            res.send(results);
        }); 
    });
});

// endpoint method create
app.post("/api/users", (req, res) => {
    // the body is a JSON object
    let body = req.body;

    // the payload passed in the POST
    // request can be accessed similar to
    // a JSON object cause of the bodyParser
    // middleware we have added before to the app
    let input = {
        "name": body["name"],
        "email": body["email"]
    };

    // 1. fetch a connection to pool
    pool.getConnection((err, conn) => {
        if(err) throw err;

        // 2. run the query / command
        // special insert syntax of mysql that sets values into the table collectively
        conn.query("insert into users set ?", input, (error, results, fields) => {
            // 3. release the connection
            conn.release();
            if(error) throw error;

            // 4. return the results in response
            res.send(results);
        });
    });
});

// endpoint method update
// the user_id is a PATH parameter
app.patch("/api/users/:user_id", (req, res) => {
    // read the path parameter from the req object
    let userid = req.params['user_id'];

    // read the payload
    let body = req.body;
    let name = body["name"];
    let email = body["email"];

    // update query
    let query = `UPDATE users SET name='${name}',email='${email}' WHERE id=${userid}`;

    // 1. fetch a connection to pool
    pool.getConnection((err, conn) => {
        if(err) throw err;

        // 2. run the query 
        conn.query(query, (error, results, fields) => {
            // 3. release the connection
            conn.release();
            if(error) throw error;

            // 4. return the results
            res.send(results);
        })
    });
});

// endpoint method delete
app.delete("/api/users/:user_id", (req, res) => {
    let userid = req.params['user_id'];

    let query = `delete from users where id=${userid}`;

    pool.getConnection((err, conn) => {
        if(err) throw err;

        conn.query(query, (error, results, fields) => {
            conn.release();
            if(error) throw error;

            res.send(results);
        });
    });
});

// self code API -> insert by Token & Body
app.post("/api/registration", (req, res) => {

    // header
    let head = req.header("token");
    
    let query = `select name from users where id=${head}`;

    let res_err_conn = {
        "code": -5,
        "msg": "Error connection!"
    };

    let res_err_token = {
        "code": -3,
        "msg": "Error token!"
    };

    let res_no_token = {
        "code": -2,
        "msg": "Token not found."
    }

    // body
    let body = req.body;

    let input = {
        "event_name": body["event_name"],
        "device": body["device"]
    };

    let empty_bdy = {
        "code": 0,
        "msg": "Body cannot empty!"
    }

    pool.getConnection((errs, conns) => {
        if(errs){
            console.log("Database connection fail!");
            res.status(500).send(res_err_conn);
        }

        conns.query(query, (error, results, fields) => {
            conns.release();
            if(error){
                console.log("Token format invalid!");
                res.status(400).send(res_err_token);
            }

            if(results == "" ){
                res.status(400).send(res_no_token);
            }
            else{
                // res.send(results);

                let err_in = {
                    "code": -1,
                    "msg": "Fail while inserting!"
                }

                let succ_in = {
                    "code": 1,
                    "msg": "Success insert user"
                }

                if(input.event_name != null && input.device != null){

                    pool.getConnection((err, conn) => {
                        if(err){
                            console.log("Database connection fail!");
                            res.status(500).send(res_err_conn);
                        }

                        conn.query("insert into log set ?", input, (error, result, fields) => {
                            conn.release();
                            if(error){
                                res.status(400).send(err_in);
                            }
                            res.status(200).send(succ_in);
                            // res.send(input);
                        });
                    });
                }
                else{
                    res.status(400).send(empty_bdy);
                }
            }
                       
        });
    });
});

// self code API -> login user
app.post("/api/auth", (req, res) => {
    let body = req.body;

    let name = body["name"];
    let pass = body["password"];

    let err_conn = {
        "msg": "Error connection"
    }

    let no_row = {
        "msg": "User not found!"
    }

    let no_body = {
        "msg": "Missing body, body cannot empty!"
    }

    if((name != null && pass != null) || (name != "" && pass != "")){
        let query = 'select name,email,addedon from users where name="'+ name + '" and password="'+ md5(pass) + '"';

        pool.getConnection((err, conn) => {
            if(err){
                console.log("Error database connection!");
                res.status(500).send(err_conn);
            }
            
            conn.query(query, (error, results, fields) => {
                
                conn.release();
    
                if(error || results == ""){
                    res.status(400).send(no_row);
                }
                else{
                    let messg = {
                        "code": 1,
                        "msg": "Authentication success",
                        "data": results
                    }
                    // console.log(md5('root123'));
                    res.status(200).send(messg);
                }
            });
        });
    }
    else{
        res.status(400).send(no_body);
    }
});