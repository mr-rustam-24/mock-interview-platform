const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
// const transporter = require("../services/email.service");

const signup = async (req, res) => {
  
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "all fields are required!",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "email already Exist!",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name,
      email: email,
      password: hashPassword,
    });


    res.status(201).json({
      success: true,
      message: "user Created Successful",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// login

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "all fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or Password is incorrect",
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Email or Password is incorrect",
      });
    }

    // jwt create
    const token = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// forgot password logic

// const forgotPassword = async (req, res) => {

   
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email fields Required",
//       });
//     }

//     const user = await User.findOne({ email });
  

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "Email Id Not Exist!",
//       });
//     }

//     const resetToken = crypto.randomBytes(32).toString("hex");

//     user.resetPasswordToken = resetToken;
//     user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

//     await user.save();

//     const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    
//     // 7. Send email
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: user.email,
//       subject: "Reset Your Password",
//       html: `
//                 <h2>Password Reset</h2>

//                 <p>Hello ${user.name},</p>

//                 <p>You requested to reset your password.</p>

//                 <p>Click the link below to reset your password:</p>

//                 <a href="${resetLink}">
//                     Reset Password
//                 </a>

//                 <p>This link will expire in 15 minutes.</p>

//                 <p>If you did not request this, please ignore this email.</p>
//             `,
//     });

//     return res.status(200).json({
//       message: "Password reset link sent to your email",
//     });
//   } catch (error) {
//      console.error("FORGOT PASSWORD ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "server error",
//     });
//   }
// };


// resetPassword logic

// const resetPassword = async (req,res) => {

//   try{
//  const {token} = req.params;
//  const {password, confirmPassword} = req.body;

//  if(!password || !confirmPassword){
//    return res.status(400).json({
//     success: false,
//     message: "All fields are required"
//    })
//  }

//  if(password !== confirmPassword){
//    return res.status(400).json({
//     success : false,
//     message : "Password Does Not Match"
//    })
//  }

//    const user = await User.findOne({
//      resetPasswordToken : token,
//      resetPasswordExpires : { $gt: Date.now()}
//    })
    

//    if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired reset token",
//       });
//     }
// console.log(user)
//     const hashPassword = await bcrypt.hash(password, 10);

//     user.password = hashPassword;

//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
// console.log("00000000")
//    await user.save();

//      return res.status(200).json({
//       success: true,
//       message: "Password reset successfully",
//     });
//   } catch (error) {
//     console.error("RESET PASSWORD ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//     });
//   }
// }

module.exports = {
  signup,
  login,
//   forgotPassword,
//   resetPassword
};
