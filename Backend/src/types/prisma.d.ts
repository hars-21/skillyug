import { User } from '@prisma/client';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Prisma {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface UserCreateInput {
      password?: string;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface UserSelect {
      password?: boolean;
    }
  }
}

export {};
