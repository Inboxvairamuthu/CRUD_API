const mongoose = require("mongoose");
const { isNull, TE, to } = require("../services/util.service");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const CONFIG = require("../config/config");

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    //optional middlename field
    middleName: {
        type: String
    },
    dob: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    //Optional occuption field
    occupation: {
        type: String
    },
    //Optional company field
    company: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    //Is Active means Delete or not Delete
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });//default timestamp

//Password hash function
UserSchema.pre('save', async function (next) {

    if (isNull(this.password)) {
        return
    }

    if (this.isModified('password') || this.isNew) {

        let err, salt, hash;
        [err, salt] = await to(bcrypt.genSalt(10))
        if (err) TE(err.message, true);

        [err, hash] = await to(bcrypt.hash(this.password, salt))
        if (err) TE(err.message, true)

        this.password = hash

    } else {
        return next()
    }
})

//Password compare bcrypt function
UserSchema.methods.comparePassword = async function (pw) {

    let err, pass
    if (!this.password) TE('password not set');
    [err, pass] = await to(bcrypt.compare(pw, this.password))
    if (err) TE(err)

    if (!pass) return null

    return this

}

//Get json web token function
UserSchema.methods.getJWT = function () {
    let expiration_time = parseInt(CONFIG.jwt_expiration)
    return 'Bearer ' + jwt.sign({ user_id: this._id }, CONFIG.jwt_encryption,
        { expiresIn: expiration_time })
}

//After the data result avoid some restricted date function
UserSchema.methods.toWeb = function () {
    let json = this.toJSON()
    json.id = this._id//this is for the front end
    json.password = undefined
    return json
}

//mongodb index stage
UserSchema.index({ '$**': 'text' });

module.exports = mongoose.model("User", UserSchema);