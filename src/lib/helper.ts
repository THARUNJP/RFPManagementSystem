import bcrypt from "bcryptjs";

/**
 * Hash a plain-text password.
 * @param password - The plain-text password.
 * @returns The hashed password as a string.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
};

/**
 * Compare a plain-text password with a hashed password.
 * @param password - The plain-text password.
 * @param hashedPassword - The hashed password stored in the database.
 * @returns True if passwords match, otherwise false.
 */
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};