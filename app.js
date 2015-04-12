var express = require('express');
   bodyParser = require('body-parser'),
   db = require("./models"),
   session = require("express-session"),
   ejs = require('ejs'),
   methodOverride = require('method-override'),
   pg = require("pg"),
   app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));


//this defines req.session
app.use(session({
    secret: 'super secret',
    resave: false,
    saveUninitialized: true
}));

// app.get('/articles', function(req,res) {
//     db.Article.all().then(function(dbArticle) {
//         res.render('article/index', {articlesList: dbArticles})
//     });
//   console.log("GET /articles");
//   res.send("Set up a response for this route!");
// });

//***NEW CODE FOR AUTHENTICATION***

// *** PART 1 - SETUP

app.use("/", function (req, res, next) {
    req.login = function (user) {
        req.session.userId = user.id;
    };

// this will request the current user's id
    req.currentUser = function() {
        return db.User.find({
            where: {
                id: req.session.userId
                //req.session.userId rather than where{id: req.session.userId}
            }
        }).
        // this will return the requested user
        then(function(user) {
            req.user = user;
            return user;
        })
    };
    // this will request the logout of the session for the user
    req.logout = function() {
        req.session.userId = null;
        req.user = null;
    }

    next();
});

// have to get the signup route and let user know it is coming soon
app.get("/signup", function (req, res) {
    res.render("signup");
});

app.post('/signup', function (req, res) {
  var user = req.body.user;
    db.User.createSecure(user.email, user.password)
     .then(function() {
         res.redirect("/profile");
     });
});


app.get("/login", function (req, res) {
    res.render("login");
});

//where the form goes

app.post("/login", function (req, res) {
   var user = req.body.user;
   
   db.User.
   authenticate(user.email, user.password).
   then(function (user) {
       req.login(user);
       res.redirect("/profile");
   });
});


app.get("/profile", function (req, res) {
    req.currentUser().
        then(function (user) {
            res.render("profile.ejs", {user: user});
        })
});



app.listen(3000, function () {
  console.log("SERVER RUNNING");
});