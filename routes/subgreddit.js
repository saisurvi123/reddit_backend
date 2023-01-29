const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/fetchuser");
const moment = require("moment");
const subgreddit = require("../models/Subgreddit");
const post = require("../models/Post");

router.get("/", (req, res) => {
  res.send("hello world");
});

router.post("/createsubgreddit", fetchuser, (req, res) => {
  // check if same name subgreddit exits
  subgreddit.findOne({ name: req.body.name }, (err, results) => {
    if (Object.keys(err).length) return res.send({ error: "error in finding" });
    else if (results) {
      return res.send({ error: "subgreddit exists with same name" });
    } else {
      const subgre1 = new subgreddit({
        name: req.body.name,
        description: req.body.description,
        tags: req.body.tags,
        bannedkeywords: req.body.bannedkeywords,
        follower: [],
        posts: [],
        user: req.user.id,
        followers: [],
      });
      subgre1.save().then((resu) => {
        res.send(resu);
      });
    }
  });
});
router.post("/joinrequest", fetchuser, (req, res) => {
  const gredditid = req.body.gredditid;
  const userid = req.user.id;
  User.findById({ _id: userid }, (err, result) => {
    if (Object.keys(err).length) return res.send({ error: "error in finding findbyid" });
    else if (!result) return res.send({ error: "no such user found" });
    else {
      let newfollowinggreddits = [].concat(result.followinggreddits, {
        id: gredditid,
        status: "requested",
      });

      const newuserdata = {
        followinggreddits: newfollowinggreddits,
      };
      User.findByIdAndUpdate(
        { _id: userid },
        { $set: newuserdata },
        { new: true },
        (err1, result1) => {
          if (Object.keys(err1).length)
            return res.send({
              error: "error in finding in findingbyIdandupdate",
            });
          else {
            // console.log("cool")
            // return res.send(result1);
          }
        }
      );
    }
    subgreddit.findById({ _id: gredditid }, (err, result) => {
      if (Object.keys(err).length) return res.send({ error: "error in finding" });
      else if (!result) return res.send({ error: "no such greddit found" });
      else {
        let newfollowers = [].concat(result.followers, {
          id: userid,
          status: "requested",
        });
        const newgredditdata = {
          followers: newfollowers,
        };
        subgreddit.findByIdAndUpdate(
          { _id: gredditid },
          { $set: newgredditdata },
          { new: true },
          (err1, result1) => {
            if (Object.keys(err1).length)
              return res.send({
                error: "error in finding in findingbyIdandupdate",
              });
            else {
              // console.log("cool")
              return res.send(result1);
            }
          }
        );
      }
    });
  });
});

router.post("/leavegreddit", fetchuser, (req, res) => {
  const gredditid = req.body.gredditid;
  const userid = req.user.id;
  User.findById({ _id: userid }, (err, result) => {
    if (Object.keys(err).length) return res.send({ error: "error in finding findbyid" });
    else if (!result) return res.send({ error: "no such user found" });
    else {
      let newfollowinggreddits = result.followinggreddits.filter((greddit1) => {
        return greddit1.id == gredditid;
      });
      newfollowinggreddits = [].concat(newfollowinggreddits, {
        id: gredditid,
        status: "rejected",
      });
      const newuserdata = {
        followinggreddits: newfollowinggreddits,
      };
      User.findByIdAndUpdate(
        { _id: userid },
        { $set: newuserdata },
        { new: true },
        (err1, result1) => {
          if (Object.keys(err1).length)
            return res.send({
              error: "error in finding in findingbyIdandupdate",
            });
          else {
            // console.log("cool")
            // return res.send(result1);
          }
        }
      );
    }
    subgreddit.findById(gredditid, (err, result) => {
      if (Object.keys(err).length) return res.send({ error: "error in finding" });
      else if (!result) return res.send({ error: "no such greddit found" });
      else {
        let newfollowers = result.followers.filter((user1) => {
          if (user1.id !== userid) return 1;
          return 0;
        });
        newfollowers = [].concat(newfollowers, {
          id: userid,
          status: "rejected",
        });
        console.log(newfollowers);
        const newgredditdata = {
          followers: newfollowers,
        };
        subgreddit.findByIdAndUpdate(
          gredditid,
          { $set: newgredditdata },
          { new: true },
          (err1, result1) => {
            if (Object.keys(err1).length)
              return res.send({
                error: "error in finding in findingbyIdandupdate",
              });
            else {
              // console.log("cool")
              return res.send(result1);
            }
          }
        );
      }
    });
  });
});

router.delete("/deletegreddit/:id", fetchuser, (req, res) => {
  //first check which user is updating the given notes id
  subgreddit.findById({ _id: req.params.id }, (err, result) => {
    if (Object.keys(err).length) return res.send({error:err});
    if (result.user.toString() !== req.user.id) {
      return res.send({ error: "permission rejected" });
    } else {
      subgreddit.findByIdAndDelete({ _id: req.params.id }, (err, result) => {
        if (Object.keys(err).length) return rs.send({error:err});
        else {
          //   console.log("cool")
          return res.send({ Message: "deletion success" });
        }
      });
    }
  });
});

router.get("/fetchallgreddits", (req, res) => {
  subgreddit.find({}, (err, results) => {
    if (Object.keys(err).length) res.send({ error: "error in fetching all greddits" });
    else {
      return res.send(results);
    }
  });
});

router.post("/getgredditbyid", (req, res) => {
  subgreddit.findById({ _id: req.body.id }, (err, results) => {
    if (Object.keys(err).length) return res.send({ error: "error in fetching greddit by id" });
    else {
      return res.send(results);
    }
  });
});
router.get("/getmygreddits", fetchuser, (req, res) => {
  subgreddit.find({ user: req.user.id }, (err, results) => {
    if (Object.keys(err).length) return res.send({ error: "error in fetching greddits" });
    else {
      return res.send(results);
    }
  });
});

router.post("/getpost", (req, res) => {
  const postid = req.body.postid;
  post.findById({ _id: postid }, (err, result) => {
    if (Object.keys(err).length) return res.send({ error: "error in findingbyid" });
    else if (!result) return res.send({ error: "error" });
    else {
      User.findById({ _id: result.postedby }, (err1, result1) => {
        if (Object.keys(err1).length) return res.send({ error: "error in finding" });
        else {
          let newres = result;
          newres = newres.toJSON();
          newres.username = result1.username;
          console.log(newres);
          // console.log(result);
          return res.send(newres);
        }
      });
    }
  });
});

router.post("/uploadpost", fetchuser, (req, res) => {
  // res.send("hello");
  const gredditid = req.body.gredditid;
  const userid = req.user.id;
  // first create post then update the subgreddit in which it is posted
  // assuming same data posts can  exist

  subgreddit.findById(gredditid, (err6, resu) => {
    if (Object.keys(err6).length) return res.send({ error: "error in finding id" });
    else {
      let alert = false;
      for (let i = 0; i < resu.bannedkeywords.length; i++) {
        let regex = new RegExp(resu.bannedkeywords[i], "i");
        console.log(regex);
        if (req.body.text.match(regex)) {
          // alert("Your post contains banned keywords");
          alert = true;
          // console.log("hello")
          break;
        }
      }
      let newtext = req.body.text;
      for (let i = 0; i < resu.bannedkeywords.length; i++) {
        let regex = new RegExp(resu.bannedkeywords[i], "ig");
        let replacedstr = "";
        for (let j = 0; j < resu.bannedkeywords[i].length; j++)
          replacedstr += "*";
        newtext = newtext.replace(regex, replacedstr);
      }
      const newpost = new post({
        text: newtext,
        postedby: userid,
        gredditid: gredditid,
        upvotes: [],
        downvotes: [],
        comments: [],
      });
      newpost.save().then((results) => {
        // link it with greddit
        subgreddit.findById({ _id: gredditid }, (err, res1) => {
          if (Object.keys(err).length) return res.send({ error: "error in finding by id" });
          else if (!res1) {
            return res.send({ error: "no such greddit" });
          } else {
            let newposts = [].concat(res1.posts, results._id);
            const newgredditdata = {
              posts: newposts,
            };
            subgreddit.findByIdAndUpdate(
              { _id: gredditid },
              { $set: newgredditdata },
              { new: true },
              (err1, result1) => {
                if (Object.keys(err1).length)
                  return res.send({
                    error: "error in finding in findingbyIdandupdate",
                  });
                else {
                  // console.log("cool")
                  let resul = result1.toJSON();
                  resul.alert = alert;
                  return res.send(resul);
                }
              }
            );
          }
        });
      });
    }
  });
});

router.post("/postcomment", fetchuser, (req, res) => {
  const userid = req.user.id;
  const postid = req.body.postid;
  post.findById({ _id: postid }, (err, result) => {
    User.findById(userid, (err4, result4) => {
      if (Object.keys(err4).length) return res.send({ error: "error" });
      else {
        let newcomments = [].concat(result.comments, {
          username: result4.username,
          userid: userid,
          comment: req.body.comment,
        });
        const newpost = {
          comments: newcomments,
        };
        post.findByIdAndUpdate(
          { _id: postid },
          { $set: newpost },
          { new: true },
          (err1, result1) => {
            if (Object.keys(err1).length)
              return res.send({
                error: "error in finding in findingbyIdandupdate",
              });
            else {
              // console.log("cool")
              return res.send(result1);
            }
          }
        );
      }
    });
  });
});

router.post("/likepost", fetchuser, (req, res) => {
  const userid = req.user.id;
  const postid = req.body.postid;
  post.findById({ _id: postid }, (err, result) => {
    if (result.upvotes.includes(userid)) {
      return res.send({ error: "already liked" });
    } else {
      let newlikes = [].concat(result.upvotes, userid);
      const newpost = {
        upvotes: newlikes,
      };
      post.findByIdAndUpdate(
        { _id: postid },
        { $set: newpost },
        { new: true },
        (err1, result1) => {
          if (Object.keys(err1).length)
            return res.send({
              error: "error in finding in findingbyIdandupdate",
            });
          else {
            // console.log("cool")
            return res.send(result1);
          }
        }
      );
    }
  });
});

router.post("/removelikepost", fetchuser, (req, res) => {
  const userid = req.user.id;
  const postid = req.body.postid;
  post.findById({ _id: postid }, (err, result) => {
    let newlikes = result.upvotes.filter((id) => id !== userid);
    const newpost = {
      upvotes: newlikes,
    };
    post.findByIdAndUpdate(
      { _id: postid },
      { $set: newpost },
      { new: true },
      (err1, result1) => {
        if (Object.keys(err1).length)
          return res.send({
            error: "error in finding in findingbyIdandupdate",
          });
        else {
          // console.log("cool")
          return res.send(result1);
        }
      }
    );
  });
});

router.post("/dislikepost", fetchuser, (req, res) => {
  const userid = req.user.id;
  const postid = req.body.postid;
  post.findById({ _id: postid }, (err, result) => {
    if (result.downvotes.includes(userid)) {
      return res.send({ error: "already liked" });
    } else {
      let newlikes = [].concat(result.downvotes, userid);
      const newpost = {
        downvotes: newlikes,
      };
      post.findByIdAndUpdate(
        { _id: postid },
        { $set: newpost },
        { new: true },
        (err1, result1) => {
          if (Object.keys(err1).length)
            return res.send({
              error: "error in finding in findingbyIdandupdate",
            });
          else {
            // console.log("cool")
            return res.send(result1);
          }
        }
      );
    }
  });
});
router.post("/removedislikepost", fetchuser, (req, res) => {
  const userid = req.user.id;
  const postid = req.body.postid;
  post.findById({ _id: postid }, (err, result) => {
    let newlikes = result.downvotes.filter((id) => id !== userid);
    const newpost = {
      downvotes: newlikes,
    };
    post.findByIdAndUpdate(
      { _id: postid },
      { $set: newpost },
      { new: true },
      (err1, result1) => {
        if (Object.keys(err1).length)
          return res.send({
            error: "error in finding in findingbyIdandupdate",
          });
        else {
          // console.log("cool")
          return res.send(result1);
        }
      }
    );
  });
});

router.post("/acceptrequest", (req, res) => {
  const userid = req.body.userid;
  const gredditid = req.body.gredditid;
  subgreddit.findById(gredditid, (err1, result1) => {
    if (Object.keys(err1).length) return res.send({ error: "error1" });
    else if (!result1) return res.send({ error: "no such greddit" });
    else {
      let newfollowers = result1.followers.filter((follower) => {
        if (follower.id !== userid || follower.status !== "requested")
          return follower;
        // if (follower.id !== userid || follower.status !== "temprejected")
        //   return follower;
      });
      newfollowers = [].concat(newfollowers, {
        id: userid,
        status: "accepted",
      });
      const newdata = {
        followers: newfollowers,
      };
      subgreddit.findByIdAndUpdate(
        { _id: gredditid },
        { $set: newdata },
        { new: true },
        (err2, result2) => {
          if (Object.keys(err2).length)
            return res.send({
              error: "error in finding in findingbyIdandupdate",
            });
          else {
            // console.log("cool")
            // return res.send(result1);
            User.findById({ _id: userid }, (err3, result3) => {
              if (Object.keys(err3).length) return res.send({ error: "error2" });
              else {
                let newfollowers = result3.followinggreddits.filter(
                  (follower) => {
                    if (
                      follower.id !== userid ||
                      follower.status !== "requested"
                    )
                      return follower;
                  }
                );
                newfollowers = [].concat(newfollowers, {
                  id: userid,
                  status: "accepted",
                });
                const newdata = {
                  followinggreddits: newfollowers,
                };
                User.findByIdAndUpdate(
                  { _id: userid },
                  { $set: newdata },
                  { new: true },
                  (err4, result4) => {
                    if (Object.keys(err4).length)
                      return res.send({
                        error: "error in finding in findingbyIdandupdate",
                      });
                    else {
                      res.send(result4);
                    }
                  }
                );
              }
            });
          }
        }
      );
    }
  });
});

router.post("/cancelrequest", (req, res) => {
  const userid = req.body.userid;
  const gredditid = req.body.gredditid;
  subgreddit.findById(gredditid, (err1, result1) => {
    if (Object.keys(err1).length) return res.send({ error: "error1" });
    else if (!result1) return res.send({ error: "no such greddit" });
    else {
      let newfollowers = result1.followers.filter((follower) => {
        if (follower.id !== userid || follower.status !== "requested")
          return follower;
      });
      newfollowers = [].concat(newfollowers, {
        id: userid,
        status: "temprejected",
      });
      const newdata = {
        followers: newfollowers,
      };
      subgreddit.findByIdAndUpdate(
        { _id: gredditid },
        { $set: newdata },
        { new: true },
        (err2, result2) => {
          if (Object.keys(err2).length)
            return res.send({
              error: "error in finding in findingbyIdandupdate",
            });
          else {
            // console.log("cool")
            // return res.send(result1);
            User.findById({ _id: userid }, (err3, result3) => {
              if (Object.keys(err3).length) return res.send({ error: "error2" });
              else {
                let newfollowers = result3.followinggreddits.filter(
                  (follower) => {
                    if (
                      follower.id !== userid ||
                      follower.status !== "requested"
                    )
                      return follower;
                  }
                );
                newfollowers = [].concat(newfollowers, {
                  id: userid,
                  status: "temprejected",
                });
                const newdata = {
                  followinggreddits: newfollowers,
                };
                User.findByIdAndUpdate(
                  { _id: userid },
                  { $set: newdata },
                  { new: true },
                  (err4, result4) => {
                    if (Object.keys(err4).length)
                      return res.send({
                        error: "error in finding in findingbyIdandupdate",
                      });
                    else {
                      res.send(result4);
                    }
                  }
                );
              }
            });
          }
        }
      );
    }
  });
});

router.post("/savepost", fetchuser, (req, res) => {
  const postid = req.body.postid;
  const userid = req.user.id;
  User.findById(userid, (err, result) => {
    if (Object.keys(err).length) return res.send({ error: "error" });
    else if (!result) return res.send({ error: "no such user" });
    if (result.savedposts.includes(postid)) {
      return res.send({ error: "already saved" });
    } else {
      let newsavedposts = [].concat(result.savedposts, postid);
      let newdata = {
        savedposts: newsavedposts,
      };
      User.findByIdAndUpdate(
        { _id: userid },
        { $set: newdata },
        { new: true },
        (err4, result4) => {
          if (Object.keys(err4).length)
            return res.send({
              error: "error in finding in findingbyIdandupdate",
            });
          else {
            res.send(result4);
          }
        }
      );
    }
  });
});
router.post("/unsavepost", fetchuser, (req, res) => {
  const postid = req.body.postid;
  const userid = req.user.id;
  User.findById(userid, (err, result) => {
    if (Object.keys(err).length) return res.send({ error: "error" });
    else if (!result) return res.send({ error: "no such user" });
    if (!result.savedposts.includes(postid)) {
      return res.send({ error: "not saved yet" });
    } else {
      let newsavedposts = result.savedposts.filter((post) => post !== postid);
      let newdata = {
        savedposts: newsavedposts,
      };
      User.findByIdAndUpdate(
        { _id: userid },
        { $set: newdata },
        { new: true },
        (err4, result4) => {
          if (Object.keys(err4).length)
            return res.send({
              error: "error in finding in findingbyIdandupdate",
            });
          else {
            res.send(result4);
          }
        }
      );
    }
  });
});

router.post("/followuser", fetchuser, (req, res) => {
  const userid = req.user.id;
  const postid = req.body.postid;
  post.findById({ _id: postid }, (err, result) => {
    const usertofollow = result.postedby;
    if (userid == usertofollow) {
      return res.send({ error: "following yourself !!! :)" });
    } else {
      User.findById({ _id: userid }, (err1, result1) => {
        if (Object.keys(err1).length) return res.send({ error: "error" });
        else if (!result1) return res.send({ error: "error" });
        else {
          // console.log(result1)
          if (result1.following.includes(usertofollow)) {
            return res.send({ error: "already following" });
          } else {
            let newfollowing = [].concat(result1.following, usertofollow);
            console.log(newfollowing);
            const newuser = {
              following: newfollowing,
            };
            User.findByIdAndUpdate(
              { _id: userid },
              { $set: newuser },
              { new: true },
              (err2, result2) => {
                if (Object.keys(err2).length)
                  return res.send({
                    error: "error in finding in findingbyIdandupdate",
                  });
                else {
                  User.findById({ _id: usertofollow }, (err3, result3) => {
                    if (Object.keys(err3).length) return res.send({ error: "error" });
                    else if (!result3) return res.send({ error: "error" });
                    else {
                      // console.log(result1)
                      // let x=result1.followers.toJSON()
                      let newfollowers = [].concat(result3.followers, userid);
                      const newuser = {
                        followers: newfollowers,
                      };
                      User.findByIdAndUpdate(
                        { _id: usertofollow },
                        { $set: newuser },
                        { new: true },
                        (err4, result4) => {
                          if (Object.keys(err4).length)
                            return res.send({
                              error: "error in finding in findingbyIdandupdate",
                            });
                          else {
                            // console.log(result2)
                            return res.send(result4);
                          }
                        }
                      );
                    }
                  });
                }
              }
            );
          }
        }
      });
    }
  });
});

router.post("/acceptrejecteduser", fetchuser, (req, res) => {
  const userid = req.body.userid;
  const gredditid = req.body.gredditid;
  subgreddit.findById(gredditid, (err1, result1) => {
    if (Object.keys(err1).length) return res.send({ error: "error1" });
    else if (!result1) return res.send({ error: "no such greddit" });
    else {
      let creationdate;
      result1.followers.find((follower) => {
        if (follower.id !== userid || follower.status !== "temprejected") {
          creationdate = follower.date;
          return follower;
        }
      });

      // let newfollowers = result1.followers.filter((follower) => {
      //   if (follower.id !== userid || follower.status !== "temprejected")
      //     return follower;
      //   // if (follower.id !== userid || follower.status !== "temprejected")
      //   //   return follower;
      // });

      creationdate = Number(creationdate);
      let currenttime = Date.now();
      console.log(creationdate);
      console.log(currenttime);
      if (currenttime - creationdate >= 2) {
        newfollowers = [].concat(newfollowers, {
          id: userid,
          status: "accepted",
        });
        const newdata = {
          followers: newfollowers,
        };
        subgreddit.findByIdAndUpdate(
          { _id: gredditid },
          { $set: newdata },
          { new: true },
          (err2, result2) => {
            if (err2)
              return res.send({
                error: "error in finding in findingbyIdandupdate",
              });
            else {
              // console.log("cool")
              // return res.send(result1);
              User.findById({ _id: userid }, (err3, result3) => {
                if (Object.keys(err3).length) return res.send({ error: "error2" });
                else {
                  let newfollowers = result3.followinggreddits.filter(
                    (follower) => {
                      if (
                        follower.id !== userid ||
                        follower.status !== "requested"
                      )
                        return follower;
                    }
                  );
                  newfollowers = [].concat(newfollowers, {
                    id: userid,
                    status: "accepted",
                  });
                  const newdata = {
                    followinggreddits: newfollowers,
                  };
                  User.findByIdAndUpdate(
                    { _id: userid },
                    { $set: newdata },
                    { new: true },
                    (err4, result4) => {
                      if (Object.keys(err4).length)
                        return res.send({
                          error: "error in finding in findingbyIdandupdate",
                        });
                      else {
                        res.send(result4);
                      }
                    }
                  );
                }
              });
            }
          }
        );
      } else {
        res.send({
          error:"You cannot join now try some other time"
        })
      }
    }
  });
});

module.exports = router;
