import mongoose from "mongoose";


const connectDB=async():Promise<void>=>{
  try{
    const con=await mongoose.connect(process.env.MONGOOSE_URL || '');

    console.log(`MongoDB Connected successfully`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1); 
  }
}


export default connectDB;