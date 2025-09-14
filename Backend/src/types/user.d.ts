import { User as PrismaUser, UserType } from '@prisma/client';

declare global {
  namespace Express {
    interface User extends PrismaUser {
      // Add any additional fields needed for the request object
    }
  }
}

export interface UserWithPassword extends PrismaUser {
  password: string;
}

export interface UserJwtPayload extends jwt.JwtPayload {
  id: string;
  email: string; // Make email required as we validate it before creating the payload
  userType: UserType;
  [key: string]: any; // Allow additional properties
}
