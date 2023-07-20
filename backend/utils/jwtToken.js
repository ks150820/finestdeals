// creating token and saving an cookie
const cookie = require('cookie');

const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();
  console.log("token =>>", token);

  // options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};

module.exports = sendToken;
