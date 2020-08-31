const mongoose = require('mongoose');

async function insertintomongo(event){

    const connectionString = 'mongodb+srv://aman29jha:aman29@cluster0-q0wyf.mongodb.net/default_dev?retryWrites=true&w=majority' ;
    try {
        mongoose.connect(connectionString);
     } catch(err) {
        throw err;
     }
     const { Schema } = mongoose;
     var ObjectIdSchema = Schema.ObjectId;

     var storeSchema = new Schema({
        name: String //,
        // phone_number: String,
        // description:  String,
        // address: {
        //     _id: ObjectIdSchema,
        //     landmark: String,
        //     street: String,
        //     state: String,
        //     city: String,
        //     country: String,
        //     pin_code: String,
        //     coordinate: {
        //         _id: ObjectIdSchema,
        //         lat: Number,
        //         lng: Number,
        //         created_at: {type: Date, default: Date.now},
        //         updated_at: {type: Date, default: Date.now}
        //         },
        //     created_at: {type: Date, default: Date.now},
        //     updated_at: {type: Date, default: Date.now}
        //    },
        //    type: String,
        //    key: String,
        //    phone_verified: Boolean,
        //    email_verified: Boolean,
        //    created_at: {type: Date, default: Date.now},
        //    updated_at: {type: Date, default: Date.now},
        //    is_active: {type: String, default: 'Active'},
        //    third_eye_verified: Boolean,
        //    isOpen: Boolean 
        });

    var Store = mongoose.model('Store', storeSchema, 'Store');
    mongoose.models = {}

    var s1 = new Store({
        name: event //.request.userAttributes.name ,
        // phone_number: event.request.userAttributes.phone_number,
        // description:  event.request.userAttributes["custom:description"],
        // address: {
        //     _id: mongoose.Types.ObjectId(),
        //     landmark: event.request.userAttributes["custom:landmark"],
        //     street: event.request.userAttributes["custom:street"],
        //     state: event.request.userAttributes['custom:state'],
        //     city: event.request.userAttributes['custom:city'],
        //     country: event.request.userAttributes['custom:country'],
        //     pin_code: event.request.userAttributes['custom:pin_code'],
        //     coordinate: {
        //         _id: mongoose.Types.ObjectId(),
        //         lat: parseFloat(event.request.userAttributes["custom:latitude"]),
        //         lng: parseFloat(event.request.userAttributes["custom:longitude"]),
        //         created_at: new Date(),
        //         updated_at: new Date()
        //         },
        //     created_at: new Date(),
        //     updated_at: new Date()
        //   },
        //   type: event.request.userAttributes["custom:type"],
        //   key: event.userName,
        //   phone_verified: false,
        //   email_verified: false,
        //   created_at: new Date(),
        //   updated_at: new Date(),
        //   is_active: 'Active',
        //   third_eye_verified: false,
        //   isOpen: true 
      });


      var result = await Store.findOne({name: event }, async function (err, docs) { 
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
            console.log(error);
          }
    });
    }
    else {
        mongoose.connection.close();
    }

}

insertintomongo('abc');