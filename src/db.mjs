import mongoose from 'mongoose';
import slugify from 'slugify';

mongoose.connect(process.env.DSN);

const NewsSchema = new mongoose.Schema({

    title: {type: String, required: true}, 
    link: {type: String, required: true},
    description: {type: String, required: true},
    date: {type: String, required: true}
});

const PlayerSchema = new mongoose.Schema({

    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    name: {type: String, required: true},
    age: {type: Number, required: true},
    sport: {type: String, required: true},
    bio: {type: String, required: true},
    news: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'News'}], default: []},
    slug: {type: String, required: true, unique: false}
});

PlayerSchema.pre('save', function(next) {
    if (this.name) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

const UserSchema = new mongoose.Schema({

    email: {type: String, required: true},
    username: {type: String, required: true},
    password: {type: String, required: true},
    verified: {type: Boolean, default: false},
    code: {type: String},
    players: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Player'}], default: []},
    slug: {type: String, required: true, unique: true}
});

UserSchema.pre('save', function(next) {
    if (this.username) {
        this.slug = slugify(this.username, { lower: true, strict: true });
    }
    next();
});

mongoose.model('User', UserSchema);
mongoose.model('Player', PlayerSchema);
mongoose.model('News', NewsSchema);