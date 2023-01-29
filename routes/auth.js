const express = require("express");
const router = express.Router();
const User = require("../models/User");
const otpverify = require("../models/Otp");
const jwt = require("jsonwebtoken");
// const cors=require(cors)
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/fetchuser");
const moment = require("moment");
router.get("/", (req, res) => {
  res.json({
    a: "sai",
    b: "kiran",
  });
});
// tool functions for  mailing

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  secure: false,
  auth: {
    user: "survisaikiran79@gmail.com",
    pass: "cldtfvgetdeokheq",
  },
});
// testing success
transporter.verify((err, success) => {
  if (Object.keys(err).length) {
    // console.log("failed to connect transmitter")
    console.log(err);
  } else {
    console.log("ready for messages");
  }
});

// for creating users
router.post(
  "/createUser",
  [
    body("email").isEmail(),
    body("password").isLength(
      { min: 5 },
      body("firstname").isLength({ min: 2 })
    ),
    body("lastname").isLength({ min: 2 }),
    body("username").isLength({ min: 2 }),
  ],
  (req, res) => {
    console.log(req.body);
    // validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // lets check for duplicates of same email or username
    else {
      // creation of user
      User.findOne({ email: req.body.email }, (err, results) => {
        if (results) {
          return res.send({ error: "enetered email is already in use" });
        }
        User.findOne({ username: req.body.username }, (err1, results1) => {
          if (Object.keys(err1).length)
            return res.send({ error: "error in finding user with same email" });
          if (results1) {
            return res.send({ error: "enetered username is already in use" });
          }
          const salt = bcrypt.genSaltSync(10);
          const secPass = bcrypt.hashSync(req.body.password, salt);
          const user1 = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            email: req.body.email,
            password: secPass,
            age: req.body.age,
            contactnumber: req.body.contactnumber,
            verified: false,
            followers: [],
            following: [],
            followinggreddits:[]
          });
          var token = jwt.sign({ id: user1.id }, "shskdfjaoeruwo");
          // console.log(token);
          user1.save().then((result) => {
            result.token = token;
            sendotp(result, res);
          });
        });
      });
    }
  }
);

// logging users

router.post(
  "/loginuser",
  [body("username").exists(), body("password").exists()],
  (req, res) => {
    //   console.log(req.body);
    // validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    } else {
      // lets
      User.findOne({ username: req.body.username }, (err, results) => {
        if (Object.keys(err).length) return res.send({ error: "failed to find with username" });
        if (!results) {
          return res.send({ error: "pls enter valid credentials" });
        } else {
          console.log(results.verified);
          // if (!results.verified) {
          //   return res.send({ error: "pls complete  your verification" });
          // } else {
          const passcomp = bcrypt.compareSync(
            req.body.password,
            results.password
          );
          if (!passcomp) {
            return res.send({ error: "pls enter valid credentials" });
          } else {
            var token = jwt.sign({ id: results.id }, "shskdfjaoeruwo");
            console.log(token);
            res.send({ authtoken: token });
          }
          // }
        }
      });
    }
  }
);
//   // getting details of users
// remove follower
router.post("/removefollower", fetchuser, (req, res) => {
  // change the following array of user with _id:req.body.id
  User.findById({ _id: req.body.id }, (err, result) => {
    if (Object.keys(err).length)
      return res.send({
        error: "error in finding user by id in removefollower route",
      });
      else {
        // console.log(result.following);
      let update = result.following.filter((x) => x !== req.user.id);
      let final = {
        following: update,
      };
      console.log(final)
      User.findByIdAndUpdate(
        { _id: req.body.id },
        { $set: final },
        { new: true },
        (err, result) => {
          if (Object.keys(err).length)
          return res.send({
            error: "error in finding in findingbyIdandupdate",
          });
          else {
            // console.log("cool")
            // return res.send(result);
          }
        }
        );
      }

    });
    // change the follower array of user with _id:req.user.id
    User.findById({ _id: req.user.id }, (err, result) => {
      if (Object.keys(err).length)
        return res.send({
          error: "error in finding user by id in removefollower route",
        });
        else {
        let update = result.followers.filter((x) => x !== req.body.id);
        let final = {
          followers: update,
        };
        console.log(final)
        User.findByIdAndUpdate(
          { _id: req.user.id},
          { $set: final },
          { new: true },
          (err, result) => {
            if (Object.keys(err).length)
            return res.send({
              error: "error in finding in findingbyIdandupdate",
            });
            else {
              // console.log("cool")
              return res.send(result);
            }
          }
          );
        }
  
      });    



  });

  router.post("/removefollowing", fetchuser, (req, res) => {
    // change the following array of user with _id:req.body.id
    User.findById({ _id: req.body.id }, (err, result) => {
      if (Object.keys(err).length)
        return res.send({
          error: "error in finding user by id in removefollower route",
        });
        else {
          // console.log(result.following);
        let update = result.followers.filter((x) => x !== req.user.id);
        let final = {
          followers: update,
        };
        console.log(final)
        User.findByIdAndUpdate(
          { _id: req.body.id },
          { $set: final },
          { new: true },
          (err, result) => {
            if (Object.keys(err).length)
            return res.send({
              error: "error in finding in findingbyIdandupdate",
            });
            else {
              // console.log("cool")
              // return res.send(result);
            }
          }
          );
        }
  
      });
      // change the follower array of user with _id:req.user.id
      User.findById({ _id: req.user.id }, (err, result) => {
        if (Object.keys(err).length)
          return res.send({
            error: "error in finding user by id in removefollower route",
          });
          else {
          let update = result.following.filter((x) => x !== req.body.id);
          let final = {
            following: update,
          };
          console.log(final)
          User.findByIdAndUpdate(
            { _id: req.user.id},
            { $set: final },
            { new: true },
            (err, result) => {
              if (Object.keys(err).length)
              return res.send({
                error: "error in finding in findingbyIdandupdate",
              });
              else {
                // console.log("cool")
                return res.send(result);
              }
            }
            );
          }
    
        });    
  
  
  
    });

router.get("/getmyid",fetchuser,(req,res)=>{
  res.send({id:req.user.id});
})


router.post("/getuser", fetchuser, (req, res) => {
  console.log(req.user);
  // console.log(req.user);
  const userid = req.user.id;
  User.findById({ _id: userid }, (err, results) => {
    if (results) {
      console.log(results);
      res.send(results);
    } else {
      res.status(401).send({ error: "pls authenticate properly" });
    }
  });
});





// sending otp to mails
const sendotp = async ({ _id, email, token }, res) => {
  const Otp = `${Math.floor(100000 + Math.random() * 900000)}`;
  console.log(token);
  const mailoptions = {
    from: "survisaikiran79@gmail.com",
    to: email,
    subject: "verification for Reddit",
    html: `<p> enter the <b>${Otp}</b> in web to verify your email address</p>
     <p>  OTP <b> expires</b> in 30 minutes</p>`,
  };
  const newotp = new otpverify({
    userId: _id,
    otp: Otp,
    createdAt: Date.now(),
    expiresAt: moment(Date.now()).add(30, "m").toDate(),
  });
  await newotp.save();
  await transporter.sendMail(mailoptions);

  res.send({
    authtoken: token,
    status: "pending",
    message: "verification otp mail sent",
    data: {
      userId: _id,
      email: email,
    },
    success: "User created successfully",
  });
  //  res.end();
};

router.put("/edituser", fetchuser, (req, res) => {
  let { email, username, age, contactnumber, password, lastname, firstname } =
    req.body;
  const userid = req.user.id;
  // if email is gonna update then make sure it is not a duplicate one
  if (email && username) {
    User.findOne({ email: email }, (err, result) => {
      if (Object.keys(err).length) return res.send({ error: "errror in finding user with email" });
      if (result) {
        return res.send({ error: " email already in use" });
      } else {
        User.findOne({ username: username }, (err1, result1) => {
          if (Object.keys(err1).length)
            return res.send({ error: "errror in finding user with username" });
          if (result1) return res.send({ error: " username already in use" });
          else {
            const newuserdata = {};
            if (email) newuserdata.email = email;
            if (username) newuserdata.username = username;
            if (age) newuserdata.age = age;
            if (contactnumber) newuserdata.contactnumber = contactnumber;
            if (password) {
              const salt = bcrypt.genSaltSync(10);
              const secPass = bcrypt.hashSync(password, salt);
              newuserdata.password = secPass;
            }
            if (lastname) newuserdata.lastname = lastname;
            if (firstname) newuserdata.firstname = firstname;
            User.findByIdAndUpdate(
              { _id: userid },
              { $set: newuserdata },
              { new: true },
              (err, result) => {
                if (Object.keys(err).length)
                  return res.send({
                    error: "error in finding in findingbyIdandupdate",
                  });
                else {
                  // console.log("cool")
                  return res.send(result);
                }
              }
            );
          }
        });
      }
    });
  } else if (username) {
    User.findOne({ username: username }, (err1, result1) => {
      if (Object.keys(err1).length)
        return res.send({ error: "errror in finding user with username" });
      if (result1) return res.send({ error: " username already in use" });
      else {
        const newuserdata = {};
        if (email) newuserdata.email = email;
        if (username) newuserdata.username = username;
        if (age) newuserdata.age = age;
        if (contactnumber) newuserdata.contactnumber = contactnumber;
        if (password) {
          const salt = bcrypt.genSaltSync(10);
          const secPass = bcrypt.hashSync(password, salt);
          newuserdata.password = secPass;
        }
        if (lastname) newuserdata.lastname = lastname;
        if (firstname) newuserdata.firstname = firstname;
        User.findByIdAndUpdate(
          { _id: userid },
          { $set: newuserdata },
          { new: true },
          (err, result) => {
            if (Object.keys(err).length)
              return res.send({
                error: "error in finding in findingbyIdandupdate",
              });
            else {
              // console.log("cool")
              return res.send(result);
            }
          }
        );
      }
    });
  } else if (email) {
    User.findOne({ email: email }, (err, result) => {
      if (Object.keys(err).length) return res.send({ error: "errror in finding user with email" });
      if (result) {
        return res.send({ error: " email already in use" });
      } else {
        const newuserdata = {};
        if (email) newuserdata.email = email;
        if (username) newuserdata.username = username;
        if (age) newuserdata.age = age;
        if (contactnumber) newuserdata.contactnumber = contactnumber;
        if (password) {
          const salt = bcrypt.genSaltSync(10);
          const secPass = bcrypt.hashSync(password, salt);
          newuserdata.password = secPass;
        }
        if (lastname) newuserdata.lastname = lastname;
        if (firstname) newuserdata.firstname = firstname;
        User.findByIdAndUpdate(
          { _id: userid },
          { $set: newuserdata },
          { new: true },
          (err, result) => {
            if (Object.keys(err).length)
              return res.send({
                error: "error in finding in findingbyIdandupdate",
              });
            else {
              // console.log("cool")
              return res.send(result);
            }
          }
        );
      }
    });
  } else {
    const newuserdata = {};
    if (email) newuserdata.email = email;
    if (username) newuserdata.username = username;
    if (age) newuserdata.age = age;
    if (contactnumber) newuserdata.contactnumber = contactnumber;
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      const secPass = bcrypt.hashSync(password, salt);
      newuserdata.password = secPass;
    }
    if (lastname) newuserdata.lastname = lastname;
    if (firstname) newuserdata.firstname = firstname;
    User.findByIdAndUpdate(
      { _id: userid },
      { $set: newuserdata },
      { new: true },
      (err, result) => {
        if (Object.keys(err).length)
          return res.send({
            error: "error in finding in findingbyIdandupdate",
          });
        else {
          // console.log("cool")
          return res.send(result);
        }
      }
    );
  }
  // console.log("cool")
});

// get connected user details based on id
router.post("/getconnection", (req, res) => {
  User.findById({ _id: req.body.id }, (err, result) => {
    if (Object.keys(err).length) return res.send({ error: "error in fidning by id" });
    else {
      return res.send(result);
    }
  });
});

// verifying otp based on entry
router.post("/verifyuser", async (req, res) => {
  try {
    let { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.send({ error: "userid or otp is not entered" });
    } else {
      //   console.log("here")
      const rec = await otpverify.find({
        userId,
      });
      if (rec.length <= 0) {
        return res.send({
          error: "acc records not found",
        });
      } else {
        const { expiresAt } = rec[0];
        const OTP = rec[0].otp;
        if (expiresAt < Date.now()) {
          await otpverify.deleteMany({ userId });
          return res.send({
            error: "time expired for otp verification",
          });
        } else {
          if (otp === OTP) {
            await User.updateOne({ _id: userId }, { verified: true });
            await otpverify.deleteMany({ userId });
            res.json({
              status: "VERIFIED",
              message: "User email verified successfully",
            });
          } else {
            res.send({ error: "incorrect otp" });
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.send({ error: error });
  }
});

module.exports = router;
