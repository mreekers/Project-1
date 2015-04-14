**read me for notes and extra things**

Major Problems / Fixes

(1) First major problem - signup page was not registering new usernames and passwords and nodemon was giving me username is undefined error message

Fix: the error message also routed me to line 51 in my user.js model, which is throwing me an error message for a user that does not exist in an authenticated database. So when i went back to my signup.ejs, i saw the action route was to my login page rather than my signup page, and once i corrected it then it was working perfectly. 

