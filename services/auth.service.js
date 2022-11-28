const {User} = require('../models');
const validator = require('validator');
const {isEmail, isMobilePhone} = validator;
const {to, TE} = require('../services/util.service');

const createUser = async function (userInfo) {
    let unique_key, err, sameUser, existingUser, userUpdate;
    unique_key = userInfo.email;

    if (!unique_key) TE('Email id not provided.');
    
    if (isEmail(unique_key)) {
        userInfo.email = unique_key;
        [err, existingUser] = await to(
            User.findOne({'email': unique_key}))
        if (err) return TE('Unknown error occurred, Please contact support.')
        if (existingUser) {
            TE('You are already signed up. Please login to continue.')
        } else {
            [err, sameUser] = await to(User.findOne({'email': unique_key}))
            if (err) TE('Unknown error occurred, Please contact support.')
            else {
                if (sameUser) {
                    [err, userUpdate] = await to(
                        User.findOneAndUpdate({'email': unique_key},
                            {$push: {type: userInfo.type}}))
                    if (err) TE(
                        'Unknown error occurred, Please contact support.')
                    else return userUpdate
                } else {
                    userInfo.verificationCode = Math.floor(100000 + Math.random() * 900000);
                    [err, user] = await to(User.create(userInfo))
                    if (err)
                        return TE(err)
                    return user
                }
            }
        }
    } else {
        TE('A valid email was not entered.')
    }
}
module.exports.createUser = createUser

const authUser = async function (userInfo) {//returns token
    let unique_key;
    let auth_info = {};
    auth_info.status = 'login';
    unique_key = userInfo.email;
    
    if (!unique_key) TE('Please enter an email or phone number to login');
    
    if (!userInfo.password) TE('Please enter a password to login');
    
    let err,user
    if (isEmail(unique_key)) {
        auth_info.method = 'email';
        
        [err, user] = await to(User.findOne({email: unique_key}))
        if (err) TE(err.message)
        
    } else if (isMobilePhone(unique_key, 'any')) {//checks if only phone number was sent
        auth_info.method = 'phone';
        
        [err, user] = await to(User.findOne({phone: unique_key}))
        if (err) TE(err.message)
        
    } else {
        TE('A valid email or phone number was not entered')
    }
    
    if (!user) {
        TE('User not registered, Please register and try again.')
    }
    
    [err, user] = await to(user.comparePassword(userInfo.password))
    
    if (err) TE(err.message)
    
    return user
    
}
module.exports.authUser = authUser

const generateCode = async function (email) {
    

    if (!isEmail(email)) {
        TE("Invalid Email id. Cannot generate code")
    }
    let err,user;
    [err, user] = await to(User.findOne({email: email}))
    
    if (err) TE(err.message)
    
    if(!user) {
        TE('Email Id doesnt exist.Cannot generate code.')
    }
    
    user.verificationCode = Math.floor(100000 + Math.random() * 900000);
    
    return user
    
}
module.exports.generateCode = generateCode
