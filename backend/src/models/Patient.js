const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters"],
        maxlength: [100, "Name cannot exceed 100 characters"],
    },
    fatherName:{
        type:String,
        required:[true,"Father Name is required"],
        trim: true,
        minlength: [2, "Father Name must be at least 2 characters"],
        maxlength: [100, "Father Name cannot exceed 100 characters"],
    },
    age:{
        type:Number,
        required:[true,"Age is required"],
        min: [0, "Age cannot be negative"],
        max: [150, "Age seems unrealistic"],
    },
    gender:{
        type:String,
        enum:["Male","Female","Other"],
        required:[true,"Gender is required"],
    },
    dryWeight:{
        type:Number,
        required:[true,"Dry Weight is required"],
        min: [0, "Weight cannot be negative"],
    },
    bloodGroup:{
        type:String,
        enum:["A+","A-","B+","B-","AB+","AB-","O+","O-"],
        required:[true,"Blood Group is required"],
    },
    hospitalUnit:{
        type:String,    
        required:[true,"Hospital Unit is required"],
        trim: true,
        uppercase: true
    },
},
{
    timestamps: true,
});

patientSchema.index({name : "text"});

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;