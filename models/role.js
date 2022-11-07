var mongoose = require("mongoose");
var rolesSchema = new mongoose.Schema({
    user_id:{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User'
    },
    dashboard :{ type:Boolean,default:false },
    businessType :{ type:Boolean,default:false },
    country :{ type:Boolean,default:false },
    newPost :{ type:Boolean,default:false },
    approvePost :{ type:Boolean,default:false },
    categories :{ type:Boolean,default:false },
    newUser:{ type:Boolean,default:false },
    businessUsers:{ type:Boolean,default:false },
    subAdmin:{ type:Boolean,default:false },
    profile:{type:Boolean,default:false},
    changePassword:{type:Boolean,default:false},
    updatedby:{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User'
    },
}, {
    timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
});

var roles = module.exports = mongoose.model("subadmin_roles", rolesSchema);
module.exports = roles;