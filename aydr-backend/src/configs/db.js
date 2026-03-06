const mongoose = require("mongoose");

mongoose
    .connect(process.env.MONGO_URI)
    .then(({ connection, models }) => {
        console.log(`Successfully connected to MongoDB host: ${connection.host}`);
        const modelNames = Object.keys(models).map(name => ({ 'models' : name }));
        console.table(modelNames);
    })
    .catch(err => {
        console.error(`Failed to establish connection with MongoDB: ${err.message}`);
        process.exit(1);    
    })