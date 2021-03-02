var express = require("express");
var app = express();
var bodyParser = require("body-parser")
var mongoose = require("mongoose");
var http = require("http").Server(app);
var io = require("socket.io")(http);

/* We use a static file */
app.use(express.static(__dirname));

/* Body-parser */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

io.on("connection", function () {
    console.log("a user is connected");
});

/* Remote Mongodb connection */
// var dbUrl = "mongodb+srv://<username>:<password>@<clustername>.deusi.mongodb.net/<db>?retryWrites=true&w=majority";
mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("mongodb is connected");
});

const msgSchema = new mongoose.Schema({
    name: String,
    message: String
});
var Message = mongoose.model("Message", msgSchema);

var server = app.listen(3000, function () {
    console.log("server is running on port", server.address().port);
});

app.get('/messages', function (req, res) {
    Message.find({}, function (err, messages) {
        res.send(messages);
    });
});

app.post('/messages', function (req, res) {
    let message = new Message(req.body);
    message.save(function (err) {
        if(err) {
            sendStatus(500);
        }
        io.emit('message', req.body);
        res.sendStatus(200);
    });
});

app.delete("/messages", function (req, res) {
    Message.deleteMany(req.body, function (err) {
        if (err) {
            sendStatus(500);
        }
        io.emit('message', req.body);
        res.sendStatus(200);
    });
});
