const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/galleriesPret", { useNewUrlParser: true, useUnifiedTopology: true }, (err, result) => {
    if (err) {
        console.log("db connection failed");
    }
    else {
        console.log("database connection successful!");
    }
})