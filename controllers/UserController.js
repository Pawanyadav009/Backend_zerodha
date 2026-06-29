import { User } from  '../model/UserModel.js'
import passport from "passport";

    export const me = (req,res)=>{
      if(req.isAuthenticated()){
        res.json({
          loggedIn : true,
          user : {
            name: req.user.name,
          email: req.user.email,
          }
        })
      }
      else{
        res.json({
          loggedIn : false
        })
      }
    }

    export const signup = async (req, res) => {
      try {
        const { name, email, password } = req.body;
    
        // Validation
        if (!name || !email || !password) {
          return res.status(400).json({
            success: false,
            message: "All fields are required",
          });
        }
    
        // Check existing user
        const existingUser = await User.findOne({ email });
    
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "Email already registered",
          });
        }
    
        const newUser = new User({
          name: name.trim(),
          email: email.trim(),
        });
    
        const registeredUser = await User.register(newUser, password);
    
        req.login(registeredUser, (err) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Login failed after signup",
            });
          }
    
          return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
              id: registeredUser._id,
              name: registeredUser.name,
              email: registeredUser.email,
            },
          });
        });
      } catch (err) {
        console.error("Signup Error:", err);
    
        return res.status(500).json({
          success: false,
          message: err.message || "Internal Server Error",
        });
      }
    }

    export const login = (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Login failed",
          });
        }

        return res.json({
          success: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
        });
      });
    })(req, res, next);
  } catch (err) {
    console.error("Login Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
    export const logout = (req, res) => {

  req.logout((err) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }

    req.session.destroy((err) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      res.clearCookie("connect.sid");

      res.json({
        success: true
      });

    });

  });

}
