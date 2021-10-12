const express = require('express')
var fs = require('fs');
const app = express()
const port = 8080;

// app.use(checkIsAuth);

// const isAuth = true;

// app.get('/dashboard', (req, res) => {
//     res.send('Dashboard Page');
// });

// app.get('/login', (req, res) => {
//     res.send('Login Page');
// });

// function checkIsAuth(){
//     isAuth ? next() : console.log("Not log in");   
// }

app.engine('html', function (filePath, options, callback) {
    fs.readFile(filePath, function(err, content){
        if(err) return callback(err)

        const rendered = content.toString()
            .replace('#title#', '<title>' + options.title + '</title>')
            .replace('#message', '<h1>' + options.message + '</h1>')
        return callback(null,rendered)
    })
})
app.set('views', 'views')
app.set('view enggine', 'html')

app.get('/', function (req, res) {
    res.render('index', { title: 'Hey', message: 'Hello there!' })
  })

app.listen(port, () => {
    console.log("App is running on port : " + port);
});