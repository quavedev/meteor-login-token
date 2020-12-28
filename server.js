LoginToken.TokenCollection = new Mongo.Collection('LoginToken_tokens');

Meteor.startup(function () {
    LoginToken.TokenCollection._ensureIndex({
        token: 1,
    });
});

// Default expiration is 1 hour
let expiration = 60 * 60 * 1000;

LoginToken.setExpiration = function (exp) {
    expiration = exp;
};

// Hat can generate unique tokens
const hat = Npm.require('hat');

// Login with just a token
Accounts.registerLoginHandler(function (loginRequest) {
    // Is there an auth token? If not, just let Meteor handle it. Call it dispatch_authToken in case there's another
    // library that uses authToken
    if (!loginRequest || !loginRequest.dispatch_authToken) {
        return undefined;
    }

    // Find the matching user from the code
    const doc = LoginToken.TokenCollection.findOne({
        token: loginRequest.dispatch_authToken,
    });

    if (!doc) {
        throw new Meteor.Error('Invalid token');
    }

    // Check expiration
    const now = Date.now();
    if (doc.expiresAt < now) {
        throw new Meteor.Error('Token has expired');
    }

    // Update it to used
    LoginToken.TokenCollection.update(doc._id, {
        $set: {
            used: true,
            usedAt: new Date(),
        },

    });

    const userId = doc.userId.toString();

    // Emit events for any listeners
    LoginToken.emit('loggedInServer', userId);

    return {
        userId: userId,
    };
});

LoginToken.findOrCreateTokenForUser = function (userId, tokenCollection = LoginToken.TokenCollection) {
    const existing = tokenCollection.findOne({
        userId: userId,
        expiresAt: {$gt: new Date()},
    });
    if (!existing) {
        const token = hat(256);
        tokenCollection.insert({
            userId: userId,
            expiresAt: new Date(Date.now() + expiration),
            token: token,
        });
        return token;
    }
    return existing;
};
