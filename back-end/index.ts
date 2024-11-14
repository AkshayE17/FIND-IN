import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoute from './routes/user.route';
import recruiterRoute from './routes/recruiter.route';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import adminRouter from './routes/admin.route';
import logger from "./config/logger";
import morgan from "morgan";

dotenv.config();

const app=express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);


app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE'], 
  credentials: true, 
}));

app.use(cookieParser());

app.use('/user',userRoute);
app.use('/recruiter',recruiterRoute);
app.use('/admin',adminRouter);

const port=process.env.PORT || 3333;

connectDB();

app.listen(port,()=>{
  console.log(`server running on http://localhost:${port}`)
})