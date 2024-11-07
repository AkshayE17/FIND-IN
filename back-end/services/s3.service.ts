import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,   
  region: process.env.AWS_REGION,   
});

export const uploadFileToS3 = (file: Express.Multer.File): Promise<string> => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `uploads/${Date.now().toString()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
      if (err) {
        console.error("Error uploading file to S3:", err);
        return reject(new Error(`Failed to upload file to S3: ${err.message}`));
      }
      resolve(data.Location);
    });
  });
};

export const deleteFileFromS3 = async (key: string): Promise<void> => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key, 
  };

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err) => {
      if (err) {
        console.error("Error deleting file from S3:", err);
        return reject(new Error(`Failed to delete file from S3: ${err.message}`));
      }
      resolve();
    });
  });
};
