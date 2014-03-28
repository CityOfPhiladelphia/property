var express = require("express")
    ,app = express();
//app.use(express.basicAuth('user', 'pass'));
var env = process.argv.length > 2 && (process.argv[2] === "prod" || process.argv[2] === "production") ? "prod" : "dev"
    ,path = "/app" + (env === "prod" ? "/build" : "")
    ,port = process.env.PORT || 9000;
app.use(express.static(__dirname + path, { maxAge: 0 }));
app.listen(port, function() { console.log("Server Running on port " + port + " [" + env + "]..."); });
