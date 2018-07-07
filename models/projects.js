var mongoose = require("mongoose");
     
    var projectSchema = new mongoose.Schema({
       name: String,
       duration: String,
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
     
    module.exports = mongoose.model("Project", projectSchema);