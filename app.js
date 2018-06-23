const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

// Load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// Map global promise
mongoose.Promise = global.Promise;

// Connect to mongoose
mongoose.connect("mongodb://localhost/vidjot-dev")
    .then((() => console.log('mongo connected')))
    .catch(err => console.log(err));

// Handlebars middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));

// body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Static directory
app.use(express.static(path.join(__dirname, 'public')))

// method override middleware
app.use(methodOverride('_method'));

// session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// flash middleware
app.use(flash());

// global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.set('view engine', 'handlebars');

// Index Route

app.get('/', (req, res) => {
    const title = 'Welcome Justin';
    res.render('index', {
        title: title
    });
});

// About Route

app.get('/about', (req, res) => {
    res.render('about');
});


app.use('/ideas', ideas);
app.use('/users', users);


const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
});
