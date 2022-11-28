const ObjectId = require('mongoose').Types.ObjectId;
const { to, ReE, ReS, isNull, isEmail } = require('../services/util.service');
const CONFIG = require('../config/config');
const HttpStatus = require('http-status');
const user = require('../models/user.model');

//Create User Account
exports.createAccount = async (req, res) => {
    //Required filed declaration
    const body = req.body;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const dob = req.body.dob;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;

    //Firstname empty validation
    if (isNull(firstName)) {
        return ReE(res, { message: 'Firstname is required!' }, HttpStatus.BAD_REQUEST);
    }

    //Firstname character validation
    if (firstName.length <3 || firstName.length >15) {
        return ReE(res, { message: 'Firstname must contain between 3 to 15 letters!.' }, HttpStatus.BAD_REQUEST);
    }

    //Lastname empty validation
    if (isNull(lastName)) {
        return ReE(res, { message: 'Lastname is required!' }, HttpStatus.BAD_REQUEST);
    }

    //Lastname character validation
    if (lastName.length <3 || lastName.length >15) {
        return ReE(res, { message: 'Lastname must contain between 3 to 15 letters!.' }, HttpStatus.BAD_REQUEST);
    }

    //DOB empty validation
    if (isNull(dob)) {
        return ReE(res, { message: 'Date of birth is required!' }, HttpStatus.BAD_REQUEST);
    }

    //Email empty validation
    if (isNull(email)) {
        return ReE(res, { message: 'Email is required!' }, HttpStatus.BAD_REQUEST);
    }

    //Email address verification
    let checkEmail = await isEmail(String(body.email).trim());

    if (!checkEmail) {
        return ReE(res, { message: 'Please enter a vaild email address!.' }, HttpStatus.BAD_REQUEST);
    }

    //Check if the email address is already there or not
    let existingEmail;
    
    [err, existingEmail] = await to(user.findOne({ 'email': email, isActive: true }));
    
    if (err) {
        return ReE(res, err, HttpStatus.BAD_GATEWAY);
    }
    
    if (!isNull(existingEmail)) {
        return ReE(res, { message: "An account using this email address already exists!." }, HttpStatus.BAD_REQUEST);
    }

    //Phone number empty validation
    if (isNull(phone)) {
        return ReE(res, { message: 'Phone number is required!' }, HttpStatus.BAD_REQUEST);
    }

    //Phone number length validation
    if (phone.toString().length < 10 || phone.length > 10) {
        return ReE(res, { message: 'Please enter a valid phone number!.' }, HttpStatus.BAD_REQUEST);
    }

    //Check if the phone number is already there or not
    let existingPhone;
    
    [err, existingPhone] = await to(user.findOne({ 'phone': phone, isActive: true }));
    
    if (err) {
        return ReE(res, err, HttpStatus.BAD_GATEWAY);
    }
    
    if (!isNull(existingPhone)) {
        return ReE(res, { message: "An account using this phone number already exists!." }, HttpStatus.BAD_REQUEST);
    }

    //Optional occupation field letters validation
    if (body.occupation.trim().length < 3 && body.occupation.trim().length > 15) {
        return ReE(res, { message: 'Occupation must contain between 3 to 15 letters!.' }, HttpStatus.BAD_REQUEST);
    }

    //Option company field letters validation
    if (body.company.trim().length < 3 && body.company.trim().length > 7) {
        return ReE(res, { message: 'Company must contain between 3 to 7 letters!.' }, HttpStatus.BAD_REQUEST);
    }

    //Password empty validation
    if (isNull(password)) {
        return ReE(res, { message: 'Password is required!' }, HttpStatus.BAD_REQUEST);
    }

    //Password field verification
    if (password.length < 6 || password.length > 15) {
        return ReE(res, { message: 'Password must contain between 6 to 15 letters or numbers!.' }, HttpStatus.BAD_REQUEST);
    }

    //Create user account query
    [err, newUser] = await to(user.create({
        firstName: firstName,
        lastName: lastName,
        middleName: body.middleName,
        dob: dob,
        email: email,
        phone: phone,
        occupation: body.occupation,
        password: password,
        isActive: true
    }));

    //If Account created or not
    if (err) {
        return ReE(res, { message: `Can not create a new user! Err:${err}` }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return ReS(res, { message: 'Account created successfully!', user: newUser.toWeb() }, HttpStatus.OK);
}

//User can login with email or phone number with password
exports.login = async (req, res) => {
    //Required field declaration
    const body = req.body;
    const userKey = req.body.userKey;//userKey means if the user login with email value or phone number value
    const password = req.body.password;

    //userKey === 'string' means provide email address value   
    if (typeof userKey === 'string') {

            //check the userkey is there or not
            [err, existingUser] = await to(user.findOne({ email: userKey, isActive: true }));       
          
            //if not there the bellow err and existingUser block return
              if (err) {
                  return ReE(res, err, HttpStatus.BAD_REQUEST)
              }
          
              if (isNull(existingUser)) {
                  return ReE(res, { message: 'User Not Found!' }, HttpStatus.BAD_REQUEST)
              }
      
              //If the password field is empty
              if (isNull(password)) {
                  return ReE(res, { message: 'Please enter a password!' }, HttpStatus.BAD_REQUEST);
              }
      
              //If the password mismatched condition
              if(String(password) != String(body.password)){
                  return ReE(res, { message: 'Password do not match!.' }, HttpStatus.BAD_REQUEST);
              }
              
              //If the password matched return existing user login
              if (String(password) == String(body.password)) {
                  return ReS(res, { message: `Welcome ${existingUser.firstName} `, token: existingUser.getJWT(), user: existingUser.toWeb() }, HttpStatus.OK)
              }
        }
    
        //userKey === 'number' means provide phone number value
        if (typeof userKey === 'number') {

            //check the userkey is there or not
            [err, existingUser] = await to(user.findOne({ phone: userKey, isActive: true }));
            
            //if not there the bellow err and existingUser block return
              if (err) {
                  return ReE(res, err, HttpStatus.BAD_REQUEST)
              }
          
              if (isNull(existingUser)) {
                  return ReE(res, { message: 'User Not Found!' }, HttpStatus.BAD_REQUEST)
              }
      
              //If the password field is empty
              if (isNull(password)) {
                  return ReE(res, { message: 'Please enter a password!' }, HttpStatus.BAD_REQUEST);
              }
              
              //If the password mismatched condition
              if(String(password) != String(body.password)){
                  return ReE(res, { message: 'Password do not match!.' }, HttpStatus.BAD_REQUEST);
              }
      
              //If the password matched return existing user login
              if (String(password) == String(body.password)) {
                  return ReS(res, { message: `Welcome ${existingUser.firstName} `, token: existingUser.getJWT(), user: existingUser.toWeb() }, HttpStatus.OK)
              }
        }

}

//Get all users details from the database
exports.getAllUsers = async (req, res) => {
    
    let err, existingUsers;

    [err, existingUsers] = await to(user.find({ isActive: true }, {password:0}));

    if (err) {
        return ReE(res, { message: `Unable to fetch users! Err:${err}` }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (existingUsers.length <= 0) {
        return ReE(res, { message: `There are no users!` }, HttpStatus.BAD_REQUEST);
    }

    return ReS(res, { message: 'Users List!', users: existingUsers }, HttpStatus.OK);

}

//Get particular user detail from databse
exports.getUser = async (req, res) => {
    const userId = req.params.userId;
    
    let err, existingUserId, existingUser;

    if (isNull(userId)) {
        return ReE(res, { message: 'Please Select User!' }, HttpStatus.BAD_REQUEST)
    }

    [err, existingUserId] = await to(user.findOne({ _id: userId, isActive: true }))

    if (err) {
        return ReE(res, err, HttpStatus.BAD_REQUEST)
    }

    if (isNull(existingUserId)) {
        return ReE(res, { message: 'User Not Found!' }, HttpStatus.BAD_REQUEST)
    }

    [err, existingUser] = await to(user.find({ userId: userId, isActive: true },{password:0}));

    if (err) {
        return ReE(res, { message: `Unable to fetch user! Err:${err}` }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (existingUser.length <= 0) {
        return ReE(res, { message: `There are no user!` }, HttpStatus.BAD_REQUEST);
    }

    return ReS(res, { message: 'User Found!', user: existingUser }, HttpStatus.OK);

}

//Update particular user
module.exports.updateUser = async (req, res) => {
    //Pass userId parameter into params
    const userId = req.params.userId;
    const data = req.body;

    let err, saveUser, existingUser, updatedUser;

    //check the given user id is there or not
    if (isNull(ObjectId(userId)) || ObjectId(userId).length <=0) {
        return ReE(res, { message: 'Please select valid user!' }, HttpStatus.BAD_REQUEST);
    }

    [err, existingUser] = await to(user.findOne({ _id: ObjectId(userId), isActive: true }));

    if (err) {
        return ReE(res, { message: `Can not fetch existing user! Err:${err}` }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(existingUser)) {
        return ReE(res, { message: 'User not found!' }, HttpStatus.BAD_REQUEST);
    }

    //if user update the firstname means check the letters length
    if (String(data.firstName).trim().length < 3 && String(data.firstName).trim().length > 15) {
        return ReE(res, { message: 'Firstname must contain between 3 to 15 letters!.' }, HttpStatus.BAD_REQUEST);
    }

    //If user update with same firstname means
    if (data.firstName == existingUser.firstName) {
        return ReE(res, { message: 'You entered same firstname!.' }, HttpStatus.BAD_REQUEST);
    }

    //if user update the lastname means check the letters length
    if (String(data.lastName).trim().length < 3 && String(data.lastName).trim().length > 15) {
        return ReE(res, { message: 'Lastname must contain between 3 to 15 letters!.' }, HttpStatus.BAD_REQUEST);
    }

    //If user update with same lastname means
    if (data.lastName == existingUser.lastName) {
        return ReE(res, { message: 'You entered same lastname!.' }, HttpStatus.BAD_REQUEST);
    }

    //if user update the middlename means check the letters length
    if (String(data.middleName).trim().length < 3 && String(data.middleName).trim().length > 15) {
        return ReE(res, { message: 'Middlename must contain between 3 to 15 letters!.' }, HttpStatus.BAD_REQUEST);
    }

    //if user can change email address means...
    if (data.email) {
        if (data.email == existingUser.email) {
            return ReE(res, { message: 'You entered same email address!.' }, HttpStatus.BAD_REQUEST);
        }
    
        let checkEmail = await isEmail(String(data.email).trim());
    
        if (!checkEmail) {
            return ReE(res, { message: 'Please enter a vaild email address!.' }, HttpStatus.BAD_REQUEST);
        }
    
        let existingEmail;
        
        [err, existingEmail] = await to(user.findOne({ 'email': email, isActive: true }));
        
        if (err) {
            return ReE(res, err, HttpStatus.BAD_GATEWAY);
        }
        
        if (!isNull(existingEmail)) {
            return ReE(res, { message: "An account using this email address already exists!." }, HttpStatus.BAD_REQUEST);
        }
    }

    //if the user can update phone number means...
    if (data.phone) {

        if (data.phone.length < 10 || data.phone.length > 10) {
            return ReE(res, { message: 'Please enter a valid phone number!.' }, HttpStatus.BAD_REQUEST);
        }
    
        if (existingUser.phone == data.phone) {
            return ReE(res, { message: 'You entered same phone number!.' }, HttpStatus.BAD_REQUEST);
        }
    
        let existingPhone;
        
        [err, existingPhone] = await to(user.findOne({ 'phone': phone, isActive: true }));
        
        if (err) {
            return ReE(res, err, HttpStatus.BAD_GATEWAY);
        }
        
        if (!isNull(existingPhone)) {
            return ReE(res, { message: "An account using this phone number already exists!." }, HttpStatus.BAD_REQUEST);
        }    

    }

    //User can not allow to update password
    if (data.password) {
        return ReE(res, { message: 'Password can not be update!' }, HttpStatus.BAD_REQUEST);
    }

    [err, saveUser] = await to(user.findById(userId));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR)
    }

    //User can update one or more field from CONFIG.editableUserFields
    if (saveUser) {
        CONFIG.editableUserFields.forEach(function (field) {
            if (typeof field === 'string' && data[field] !== undefined) {
                saveUser[field] = data[field]
            }
        });

        //If the data updated set update time
        saveUser.updatedAt = new Date(0);

        [err, updatedUser] = await to(saveUser.save());

        if (err) {
            return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR)
        }

        //User updated response
        if (updatedUser) {
            return ReS(res, { message: 'User Updated!', user: updatedUser.toWeb() }, HttpStatus.OK)
        }

        if (!updatedUser) {
            return ReE(res, { message: 'Something Went Wrong, Can Not Update The User!' }, HttpStatus.BAD_REQUEST)
        }
    }
}

//Delete particular user
module.exports.deleteUser = async (req, res) => {
    //Pass user id parameters into params
    const userId = req.params.userId;

    let err, existingUser;

    if (isNull(userId)) {
        return ReE(res, { message: 'Please Select User!' }, HttpStatus.BAD_REQUEST)
    }

    //Check the user is there or not
    [err, existingUser] = await to(user.findOne({ _id: userId, isActive: true }));

    if (err) {
        return ReE(res, err, HttpStatus.BAD_REQUEST)
    }

    if (isNull(existingUser)) {
        return ReE(res, { message: 'User Not Found!' }, HttpStatus.BAD_REQUEST)
    }

    //After the user is avilable delete process
    let deleteUserData;

    //isActive = true means user delete or not so we can update the isActive filed name into flase
    [err, deleteUserData] = await to(user.updateOne({ _id: userId, isActive: true }, { $set: { isActive: false } }));

    if (err) {
        return ReE(res, err, HttpStatus.BAD_REQUEST);
    }

    //After change the value send the response
    if (deleteUserData.nModified == 0) {
        return ReE(res, { message: 'Something Went Wrong To Delete The User!' }, HttpStatus.BAD_REQUEST)
    }

    if (deleteUserData.nModified != 0) {
        return ReS(res, { message: 'User Deleted!' }, HttpStatus.OK);
    }

}