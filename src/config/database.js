const mongoose = require("mongoose");

main().then((res) => console.log("db connected successfully..!!"));
main().catch((err) => console.log("db not connected...!!!", err));

async function main() {
  await mongoose.connect(
    "mongodb+srv://vijaymarka:admin123@cluster0.ivjiolu.mongodb.net/JuneTutor?retryWrites=true&w=majority"
  );
}
