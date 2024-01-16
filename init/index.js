const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

const MONGO_URL="mongodb://localhost:27017/wanderlust";

async function main(){
    await mongoose.connect(MONGO_URL);
}

main().then(()=>{
    console.log("Connection Successful");
}).catch((err)=>{
    console.log(err); 
});
const initDB=async()=>{
    await Listing.deleteMany({});

    initData.data=initData.data.map((obj)=>({
        ...obj,
        owner:"659cd728ddec5f34cce41031",
    }))
    await Listing.insertMany(initData.data);
    console.log("Data was initializes");
}
initDB();