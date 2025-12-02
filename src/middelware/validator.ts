import { NextFunction, RequestHandler,Request,Response } from "express";
import { ZodError, ZodType } from "zod";


export const validateBody = (schema: ZodType): RequestHandler =>
  (req:Request, res:Response, next:NextFunction) => { // currying fucntion

    try{
     const body = req.body;
      schema.parse(body);
      next()
    }
   catch (err: unknown) {
  if (err instanceof ZodError) {
    console.log(err);
    
    const formattedErrors: Record<string, string> = {};
    err.issues.forEach(issue => {
      const path = issue.path.join("."); // supports nested objects
      formattedErrors[path] = issue.message;
    });

    return res.status(400).json({
      success: false,
      errors: formattedErrors,
    });
  }

  return res.status(500).json({
    success: false,
    errors: { message: "Internal server error" },
  });
}
}