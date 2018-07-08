var mongoose = require("mongoose");
     
    var memberSchema = new mongoose.Schema({
       name: String,
       title: String,
       description: String,
       image: String,
       author: {
           id: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "User"
           },
           username: String
       }
       
    });
     
    module.exports = mongoose.model("Member", memberSchema);