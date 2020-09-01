const crypto_secure_random_digit = require("crypto-secure-random-digit");
const mongoose = require('mongoose');
const AWS = require("aws-sdk");
var sns = new AWS.SNS();



// Main handler
exports.handler = async (event = {}) => {
    console.log('RECEIVED event: ', JSON.stringify(event, null, 2));
    
    let passCode;
    var phoneNumber = event.request.userAttributes.phone_number;
    
    // The first CUSTOM_CHALLENGE request for authentication from
    // iOS AWSMobileClient actually comes in as an "SRP_A" challenge (a bug in the AWS SDK for iOS?)
    // web (Angular) comes in with an empty event.request.session
    if (event.request.session && event.request.session.length && event.request.session.slice(-1)[0].challengeName == "SRP_A" || event.request.session.length == 0) {

        passCode = crypto_secure_random_digit.randomDigits(6).join('');
        await sendSMSviaSNS(phoneNumber, passCode); 
        await insertintomongo(event);

    } else {
        
        const previousChallenge = event.request.session.slice(-1)[0];
        passCode = previousChallenge.challengeMetadata.match(/CODE-(\d*)/)[1];
    }
    event.response.publicChallengeParameters = { phone: event.request.userAttributes.phone_number };
    event.response.privateChallengeParameters = { passCode };
    event.response.challengeMetadata = `CODE-${passCode}`;
        
    console.log('RETURNED event: ', JSON.stringify(event, null, 2));
    
    return event;
};

// Send secret code over SMS via Amazon Simple Notification Service (SNS)
async function sendSMSviaSNS(phoneNumber, passCode) {
    const params = { "Message": "<#>" + passCode + " is the OTP for your Third Eye account verification." + "JrgYxU2yI00", "PhoneNumber": phoneNumber };
    await sns.publish(params).promise();
}




async function insertintomongo(event){

    const connectionString = 'mongodb+srv://aman29jha:aman29@cluster0-q0wyf.mongodb.net/Prisma-Atlas-Server_prod?retryWrites=true&w=majority' ;
    try {
        await mongoose.connect(connectionString, {
            useUnifiedTopology: true,
            useNewUrlParser: true
          });
     } catch(err) {
        throw err;
     }
     const { Schema } = mongoose;
     var ObjectIdSchema = Schema.ObjectId;

     var storeSchema = new Schema({
        name: String,
        phone_number: String,
        description:  String,
        address: {
            _id: ObjectIdSchema,
            landmark: String,
            street: String,
            state: String,
            city: String,
            country: String,
            pin_code: String,
            coordinate: {
                _id: ObjectIdSchema,
                lat: Number,
                lng: Number,
                created_at: {type: Date, default: Date.now},
                updated_at: {type: Date, default: Date.now}
                },
            created_at: {type: Date, default: Date.now},
            updated_at: {type: Date, default: Date.now}
           },
           type: String,
           key: String,
           phone_verified: Boolean,
           email_verified: Boolean,
           created_at: {type: Date, default: Date.now},
           updated_at: {type: Date, default: Date.now},
           is_active: {type: String, default: 'Active'},
           third_eye_verified: Boolean,
           isOpen: Boolean 
        });

    var Store = mongoose.model('Store', storeSchema, 'Store');
    mongoose.models = {}

    var s1 = new Store({
        name: event.request.userAttributes.name,
        phone_number: event.request.userAttributes.phone_number,
        description:  event.request.userAttributes["custom:description"],
        address: {
            _id: mongoose.Types.ObjectId(),
            landmark: event.request.userAttributes["custom:landmark"],
            street: event.request.userAttributes["custom:street"],
            state: event.request.userAttributes['custom:state'],
            city: event.request.userAttributes['custom:city'],
            country: event.request.userAttributes['custom:country'],
            pin_code: event.request.userAttributes['custom:pin_code'],
            coordinate: {
                _id: mongoose.Types.ObjectId(),
                lat: parseFloat(event.request.userAttributes["custom:latitude"]),
                lng: parseFloat(event.request.userAttributes["custom:longitude"]),
                created_at: new Date(),
                updated_at: new Date()
                },
            created_at: new Date(),
            updated_at: new Date()
          },
          type: event.request.userAttributes["custom:type"],
          key: event.userName,
          phone_verified: false,
          email_verified: false,
          created_at: new Date(),
          updated_at: new Date(),
          is_active: 'Active',
          third_eye_verified: false,
          isOpen: true 
      });

    var result = await Store.findOne({phone_number: event.request.userAttributes.phone_number }, async function (err, docs) { 
        if (err){ 
            return
        } 
        else{ 
            return docs;
        } 
    });

    if (!result ) {
        await s1.save( async function(error) {
          console.log("Your record has been saved");
          
          mongoose.connection.close();
  
          if (error) {
              mongoose.connection.close();
              throw error;
            }
      });
      }

    else {
          mongoose.connection.close();
      }


    //   await s1.save(async function(error) {
    //     console.log("Your bee has been saved!");
        
    //     mongoose.connection.close();

    //     if (error) {
    //         throw error;
    //       }
    // });

}