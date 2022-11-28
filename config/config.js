let CONFIG = {} //Make this global to use all over the application

CONFIG.app = process.env.APP || 'development';
CONFIG.port = process.env.PORT || '3000'; // Default port number

CONFIG.db_uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crud'; //Local database URI

//Configuration for Json Web Token
CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || 'jwt_please_change';
CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || '28800';

//Default verification URL
CONFIG.verification_url = process.env.VERIFICATION_URL || 'http://localhost';

//Update user requirement fields
CONFIG.editableUserFields = process.env.EDITABLE_USER_FIELDS || ['firstName', 'lastName', 'middleName', 'dob', 'email', 'phone', 'occupation', 'company'];

module.exports = CONFIG;