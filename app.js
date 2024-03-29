// if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
// }

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const MongoDBStore = require("connect-mongo")(session);
// const helmet = require('helmet');

const expressMongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
 const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp-v2";

 //process.env.DB_URL
//mongodb://localhost:27017/yelp-camp-v2
//dbUrl

mongoose.connect(dbUrl,{
    useNewUrlParser : true,
    useUnifiedTopology : true,
});

const app = express();

const db = mongoose.connection;
db.on('error',console.error.bind(console,'Mongo connection error!'));
db.once('open', () => {
    console.log('Mongo database connected');
})

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname,'public')));

app.use(express.urlencoded({ extended : true }));
app.use(methodOverride('_method'));
app.use(expressMongoSanitize());
// app.use(helmet());


const secret = process.env.SECRET || 'thisshouldbemysecret';

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})


const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave : false,
    saveUninitialized : true,
    cookie : {
        httpOnly : true,
        expires : Date.now() + 1000*60*60*24*7,
        maxAge : 1000*60*60*24*7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.get('/fakeUser',async(req,res) => {
    const user = new User({email:'fakeuser@gmail.com', username:'fakeUser'});
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
})




app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)


app.get('/', (req,res) => {
    res.render('Home');
})



app.all('*', (req,res,next) => {
    next(new ExpressError('Page not Found',404));
})

app.use((err,req,res,next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Something went wrong!';
    res.status(statusCode).render('error', { err } );
})

const port = process.env.PORT || 3000

app.listen(port,() => {
    console.log(`Server listening on port ${port}`);
})