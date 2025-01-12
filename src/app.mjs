import './config.mjs';
import './db.mjs';
import mongoose from 'mongoose';
import express from 'express';
import session from 'express-session';
import path from 'path'
import url from 'url';
import slugify from 'slugify';
import * as auth from './auth.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const app = express();

app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({

    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));

const User = mongoose.model('User');
const Player = mongoose.model('Player');
const News = mongoose.model('News');

const authReqPaths = ['/tracker/:userSlug/players/:playerSlug', '/tracker/:slug', '/add', '/remove'];

app.use(function(req, res, next) {

    if (authReqPaths.includes(req.path)) {

      if (!req.session.user || !req.session.user.verified) {

        res.redirect('/login'); 

      } else {

        next(); 
      }
    } else {

      next(); 
    }
});

app.use(function(req, res, next) {

    res.locals.user = req.session.user;
    next();
})

app.use(function(req, res, next) {

    console.log(req.path.toUpperCase(), req.body);
    next();
});

app.get('/', async (req, res) => {

    try {

        const user = await User.findById(req.session.user._id);
        res.redirect(`tracker/${user.slug}`)

    } catch (err) {

        res.redirect('login');
    };
});

app.get('/tracker', async(req, res) => {

    const user = await User.findById(req.session.user._id).populate('players');

    res.render('tracker', { players: user.players });
});

// user profile
app.get('/tracker/:slug', async (req, res) => {

    try {

        const slug = req.params.slug;

        if (!req.session.user || req.session.user.slug !== slug || !req.session.user.verified) {

            return res.redirect('/login'); 
        }

        const user = await User.findOne({slug}).populate('players');

        res.render('user-page', {

            username: user.username,
            players: user.players,
            userSlug: user.slug
        });

    } catch (error) {

        res.send("error with loading user page");
    }
});

// get specific player page
app.get('/tracker/:userSlug/players/:playerSlug', async (req, res) => {

    try {

        const {userSlug, playerSlug} = req.params;

        if (!req.session.user || req.session.user.slug !== userSlug || !req.session.user.verified) {

            return res.redirect('/login');
        }

        const user = await User.findOne({slug: userSlug}).populate('players');

        if (!user) {
            
            return res.status(404).send('User not found');
        }

        const player = await Player.findOne({ slug: playerSlug }).populate('news');

        if (!player) {
            return res.status(404).send('Player not found');
        }

        res.render('player-detail', {

            player: player,
            news: player.news,
            userSlug,
            playerSlug
        }) 

    } catch (err) {

        res.send("error with loading player page");
    }
});


app.get('/tracker/:userSlug/players/:playerSlug/add-news', async (req, res) => {

    const { userSlug, playerSlug } = req.params;

    if (!req.session.user || req.session.user.slug !== userSlug || !req.session.user.verified) {

        return res.redirect('/login');
    }

    res.render('add-news', { 
        userSlug, 
        playerSlug 
    });
});

app.post('/tracker/:userSlug/players/:playerSlug/add-news', async (req, res) => {

    try {

        const { userSlug, playerSlug } = req.params;

        if (!req.session.user || req.session.user.slug !== userSlug || !req.session.user.verified) {

            return res.redirect('/login');
        }

        const newNews = new News({

            title: req.body.title,
            link: req.body.link,
            description: req.body.desc,
            date: req.body.date
        });

        await newNews.save();

        const player = await Player.findOne({slug: playerSlug});

        if (!player) {
            console.log('player not foudn');
        }

        player.news.push(newNews._id);
        await player.save();

        res.redirect(`/tracker/${userSlug}/players/${playerSlug}`);

    } catch (error) {

        console.log(error);
    }
});

// registration
app.get('/register', function(req, res) {

    res.render('register');
});

app.post('/register', async (req, res) => {

    try {

        const slug = slugify(req.body.username, {lower: true, strict: true});
        const newUser = await auth.register(req.body.email, req.body.username, req.body.password, slug);
        await auth.startLogin(req, newUser);
        res.redirect('verify-email');

    } catch (err) {

        console.log(err);
        res.send('Error with registration');
    }
});

app.get('/verify-email', async (req, res) => {

    const verificationCode = auth.sendVerification(req.session.user.email);
    const user = req.session.user._id;

    await User.findByIdAndUpdate(user,

        {code: verificationCode},
        {new: true}
    );

    req.session.user.code = verificationCode;

    res.render('verify-email');
});

app.post('/verify-email', async (req, res) => {
    
    const userInput = req.body.verification;

    if (req.session.user.code === userInput) {

        await User.findByIdAndUpdate(req.session.user._id,

            {verified: true},
            {new: true}
        );
        req.session.user.verified = true;

        res.redirect('/');

    } else {

        res.send('error with verification');
    }
});

// login
app.get('/login', function(req, res) {

    res.render('login');
});

app.post('/login', async (req, res) => {

    try {

        const user = await auth.login(req.body.username, req.body.password);
        await auth.startLogin(req, user);
        res.redirect(`tracker/${user.slug}`);

    } catch (error) {

        console.log(error);

        if (error.message !== 'You have not verified your account') {

            res.render('login', {message: error.message});

        } else {

            res.render('login', {unverified: error.message});
        }
    }
});

// logout
app.get('/logout', async (req, res) => {

    try {

        await auth.endLogin(req);
        res.clearCookie('connect.sid');

        res.redirect('/login');
    
    } catch (error) {

        console.log("error: " + error)
    }
});

// add player
app.get('/add', function(req, res) {

    res.render('add');
});

app.post('/add', async (req, res) => {

    try {

        const slug = slugify(req.body.name, { lower: true, strict: true });

        const player = new Player({

            name: req.body.name,
            sport: req.body.sport,
            age: req.body.age,
            bio: req.body.bio,
            user: req.session.user._id,
            slug: slug
        });

        await player.save();

        await User.findByIdAndUpdate(req.session.user._id,

            {$push: { players: player._id } },
            {new: true}
        );

        res.redirect('/');

    } catch (err) {

        res.send('error with adding player');
    }
});

// remove
app.get('/remove', async (req, res) => {

    const user = await User.findById(req.session.user._id).populate();

    res.render('remove', { players: user.players });
});

app.post('/remove', async (req, res) => {

    const playerId = req.body._id;

    await User.findByIdAndUpdate(req.session.user._id,

        {$pull : { players: {_id: playerId} } },
        {new: true}
    );

    await Player.deleteOne({_id: playerId});

    res.redirect('/');
});

app.listen(process.env.PORT ?? 3000);
