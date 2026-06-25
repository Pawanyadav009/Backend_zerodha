const mongoose = require('mongoose');
const { Schema } = mongoose;

const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true
  }
});

UserSchema.plugin(
  passportLocalMongoose.default || passportLocalMongoose,
  {
    usernameField: 'email'
  }
);

module.exports = { UserSchema };