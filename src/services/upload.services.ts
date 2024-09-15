import { SelectUser } from "@/db/schemas";
import { createR2Client } from "@/lib/r2";
import { getAuth } from "@/utils/get-auth";
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { Context } from "hono";

// UPLOAD A FILE
export const uploadFileService = async (
  c: Context,
  user: SelectUser,
  file: File,
  path: string
) => {
  const R2 = createR2Client(c);

  const sizeLimit = Number(c.env.DEFAULT_UPLOAD_SIZE! ?? "2") * 1024 ** 2;

  console.log(sizeLimit);
  console.log(file.size);

  if (file.size > sizeLimit) {
    throw new Error("File size is too large");
  }

  const fileExtension = file.name.split(".").pop();
  const userFirstName = user.name?.split(" ")[0];
  const objKey = `psychologists/${
    userFirstName + "_" + user.id
  }${path}/${new Date().toISOString()}.${fileExtension}`;

  await R2.send(
    new PutObjectCommand({
      Bucket: c.env.R2_BUCKET_NAME,
      Key: objKey,
      Body: file,
      ContentLength: file.size,
      ContentType: file.type,
    })
  );

  // CDN building cdn URL
  const cdnUrl = `https://media.psycohub.com/${objKey}`;

  return cdnUrl;
};

// UPLOAD MULTIPLE FILES
export const uploadMultipleFilesService = async (
  c: Context,
  user: SelectUser,
  files: File[],
  path: string
) => {
  const uploadedFiles = await Promise.all(
    files.map((file) => uploadFileService(c, user, file, path))
  );

  return uploadedFiles;
};

// DELETE A FILE
export const deleteFileService = async (
  c: Context,
  user: SelectUser,
  path: string
) => {
  const R2 = createR2Client(c);

  try {
    const res = await R2.send(
      new DeleteObjectCommand({
        Bucket: c.env.R2_BUCKET_NAME,
        Key: `${path}`,
      })
    );
    console.log(res);
  } catch (error) {
    throw new Error("Error trying to delete avatar");
  }
};

// DELETE FOLDER
export const deleteFolderService = async (
  c: Context,
  bucket: string,
  folder: string
) => {
  try {
    const R2 = createR2Client(c);

    // Listar todos os objetos na pasta
    const listParams = {
      Bucket: bucket,
      Prefix: folder,
    };

    console.log(listParams);

    const listedObjects = await R2.send(new ListObjectsV2Command(listParams));

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return "No objects found";
    }

    // delete all objects
    const deleteParams = {
      Bucket: bucket,
      Delete: {
        Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
      },
    };

    const data = await R2.send(new DeleteObjectsCommand(deleteParams));

    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting folder:", error);
      throw new Error(`Failed to delete folder: ${error}`);
    }
  }
};

// UPDATE A FILE
export const updateFileService = async (
  c: Context,
  user: SelectUser,
  oldPath: string,
  file: File,
  newPath: string
) => {
  const sizeLimit = Number(c.env.DEFAULT_UPLOAD_SIZE! ?? "2") * 1024 ** 2;

  if (file.size > sizeLimit) {
    throw new Error("File size is too large");
  }

  try {
    // Deleting the old file
    await deleteFileService(c, user, oldPath);

    // Uploading the new file
    const cdnUrl = await uploadFileService(c, user, file, newPath);

    return cdnUrl;
  } catch (error) {
    throw new Error("Error trying to update file");
  }
};
