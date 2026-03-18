const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    patientId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Patient",
        required : [true,"Patient ID is required"],
    },
    hospitalUnit:{
        type:String,    
        required:[true,"Hospital Unit is required"],
        trim: true,
        uppercase: true
    },
    sessionDate:{
        type: Date,
        required : [true,"Session Date is required"],
    },
    preWeight : {
        type : Number,
        required : [true,"Pre-weight is required"],
        min : [0,"Pre-weight cannot be negative"],
    },
    postWeight : {
        type : Number,
        min : [0,"Post-weight cannot be negative"],
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED"],
      default: "SCHEDULED",
    },
    startTime:{
        type: Date,
    },
    endTime:{
        type: Date,
    },
    duration:{
        type: Number,
        min : [0,"Duration cannot be negative"],
    },
    preBP: {
      systolic: { type: Number, min: 50, max: 250 },
      diastolic: { type: Number, min: 30, max: 150 },
    },
    postBP: {
      systolic: { type: Number, min: 50, max: 250 },
      diastolic: { type: Number, min: 30, max: 150 },
    },
    anomalies : {
      type: [
        {
          type: {
            type: String,
            enum: ["BP", "WEIGHT", "DURATION"],
          },
          message: String,
          severity: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
          },
        },
      ],
      default: [],
    },
    notes : {
        type : String,
        trim : true,
        maxlength: [500, "Notes cannot exceed 500 characters"]
    },
    dialysisMachineId : {
        type : String,
        trim : true,
        required : [true,"Dialysis Machine is required"],
    },
},{ 
    timestamps : true,
});

sessionSchema.index({ hospitalUnit: 1, sessionDate: -1 });

const Session = mongoose.model("Session", sessionSchema);
module.exports = Session;