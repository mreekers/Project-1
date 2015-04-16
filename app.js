var express = require('express'),
    bodyParser = require('body-parser'),
    db = require("./models"),
    session = require("express-session"),
    ejs = require('ejs'),
    methodOverride = require('method-override'),
    pg = require("pg"),
    app = express(),
    request = require('request');

// variables for the env to hide keys
var env = process.env;
var api_key = env.MY_API_KEY;

// yelp keys for the yelp API
var yelp = require("yelp").createClient({
    consumer_key: "E9ROHR4zeUuaoURLmSMuvg", 
    consumer_secret: "Wy5q8Q0UVWBpWhwqVtUUstVUieA",
    token: "_Vkq0jrAWCoXOE0otP_vAfCQGwNTw7hy",
    token_secret: "j7umhpK-fM4-HwNwhvppWRdE0Fk"
});

    
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}));

// forgot this when my logout button wouldn't log the user out; logout now works 
app.use(methodOverride('_method'))


//this defines req.session
app.use(session({
    secret: 'super secret',
    resave: false,
    saveUninitialized: true
}));

//yelp API code

//Part 2 - API functionality

app.get('/search', function(req, res) {
    console.log(req.query);
    // will look up the city you want with the search parameters open mic comedy already inputted
    var city = req.query.city;
    if (!city) {
      res.render('search', {results: []});
    } else {
    yelp.search({term: "open mic comedy", location:city}, function(error, data) {
    console.log(error);
    console.log(data);
    res.render('search', {results: data.businesses}); // data of businesses is the yelp id parameters given in terminal
    });
  }
});



app.post('/favorites', function(req,res){
  var selectedName = req.body.name;
  db.Favorite.create({name: selectedName, UserId: req.session.userId})
    .then(function(){
      res.redirect('/profile');
    });

  // req.currentUser().then(function(dbUser){
  //   if (dbUser) {
  //     dbUser.addToFavs(name).then(function(name){
  //       res.redirect('/profile');
  //     });
  //   } else {
  //     res.redirect('/login');
  //   }
  // });
});
// }
//     yelp.search({term: comedyclubs, location: city}, function(error, data) {
//          console.log("This is an error " + error);
//          console.log("This is our data " + data);
//        res.render('/search', {results: data.businesses});
//    });
// }

// app.get('/search',function(req,res){
//   var micSearch = req.query.mics;
//   if (!micSearch) {
//       res.render("search", {mics: [], noMics: true});
//   } else {
//     var url = "http://api.yelp.com/v2/search?term=comedyclubs&location="+micSearch;

//     request(url, function(err, resp, body){
//       console.log("I'm in here 2");
//       var jsonData = JSON.parse(body);
//       console.log(jsonData);
//       var addresses = jsonData.response.comedyclubs
//       console.log(addresses)
//       res.render('location.ejs')
//       // if (!err && resp.statusCode === 200) {
//       //   console.log("I'm in here 3");
//       //   var jsonData = JSON.parse(body);
//       //   if (!jsonData.Search) {
//       //     res.render("search", {mics: [], noMics: true});
//       //   }
//       //   res.render("search", {mics: jsonData.Search, noMics: false});
//       // }
//     });
//   }
// });

// app.get('/location', function(req,res){
//   var micID = req.query.id;

//   var url = 'http://api.yelp.com/v2/business/{id}='+micID;
//   request(url, function (err, resp, body){
//     if (!err && resp.statusCode === 200) {
//       var micData = JSON.parse(body);
//       res.render("location", {mic: micData});  
//     }
//   });
// });




// We have our location route that renders our location view
app.get('/location', function(req,res) {
  res.render('location', {location: {Name: "Club Here"}});
});

//**PART 1 - INITIAL SETUP - LOGIN / SIGNUP / PROFILE PAGES

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

app.get("/", function (req, res) {
  res.render("index");
})

// have to get the signup route and let user know it is coming soon
app.get("/signup", function (req, res) {
    res.render("signup");
});

// want to create secure users with emails and passwords on the signup page and redirect to their profile page 
app.post('/signup', function (req, res) {
  var user = req.body.user;
    db.User.createSecure(user.email, user.password)
     .then(function() {
         res.redirect("/profile");
     });
});

app.delete('/logout', function(req,res){
  req.logout();
  res.redirect('/login');
});

//simply to render login.ejs
app.get("/login", function (req, res) {
  req.currentUser().then(function(user) {
    if (user) {
      res.redirect('/');
    } else {
      res.render("login");
    }
  });
    
});

//going to authenticate users via their email and password in the secure database and route them to their profile page 

app.post("/login", function (req, res) {
   var user = req.body.user;
   
   db.User.
   authenticate(user.email, user.password).
   then(function (user) {
       req.login(user);
       res.redirect("/login");
   });
});

//profile page, eventually want the search function for the external API to go in here or maybe have it route to another page to use 

//***
app.get('/profile', function(req, res) {
    req.currentUser().then(function(user) {
        if (user) {
            //'get' is Sequelize code
            user.getFavorites().then(function(favorites) {
                res.render('profile', { user: user, favorites: favorites });
            });
        } else {
            res.redirect('/login');
        }
    });
});

// Models code with association - Users and Favorites 

// app.get('/profile', function(req,res){
//   req.currentUser().then(function(dbUser){
//     if (dbUser) {
//       db.Favorite.findAll({where: {UserId: dbUser.id}})
//         .then(function(name){
//           console.log("\n\n\n\n\nHELLO", name);
//         res.render('user/profile', {ejsUser: dbUser});
//       });
//     } else {
//       res.redirect('/login');
//     }
//   });
// });





app.get('/sync', function (req, res) {
  db.sequelize.sync().then(function() {
    res.send("Sequelize Synchronization is Complete");
  });
});


app.listen(process.env.PORT || 3000, function () {
  console.log("SERVER RUNNING");
});