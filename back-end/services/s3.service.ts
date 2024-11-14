

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'; 
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },  
})


export const generatePresignedUrl = async (fileName: string, fileType: string): Promise<string> => {
  try {
    console.log('Generating presigned URL for:', { fileName, fileType });

    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${sanitizedFileName}`,
      ContentType: fileType,
      
    };

    console.log('S3 params:', params);

    const signedUrl = new PutObjectCommand(params);
    console.log('Generated presigned URL:', signedUrl);
    const url = await getSignedUrl(s3Client,signedUrl ,{expiresIn: 300});

    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};
