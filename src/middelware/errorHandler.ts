// src/middleware/errorHandler.ts
import { NextFunction, Request, Response } from "express";
import AppError from "../lib/errors/appError";
import { Prisma } from "@prisma/client";


export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let clientMessage = "Internal Server Error";

  //  Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    clientMessage = err.message;
  }
  //  Handle Prisma known errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 400;
      const target = err.meta?.target as string[] | undefined;
      clientMessage = target
        ? `Duplicate value for field(s): ${target.join(", ")}`
        : "Duplicate value.";
    } else if (err.code === "P2025") {
      statusCode = 404;
      clientMessage = "Record not found.";
    }
  }
  //  Prisma validation errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    clientMessage = "Invalid data sent to database.";
  }
  //  Prisma init errors
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 500;
    clientMessage = "Database connection failed.";
  }

  // Log full error for internal debugging
  console.log({
    requestId: Date.now(),
    message: err.message,
    stack: err.stack,
    status: statusCode,
    url: req.originalUrl,
    method: req.method,
  });

  // Send clean JSON response
  res.status(statusCode).json({
    status: false,
    message: clientMessage,
  });
};