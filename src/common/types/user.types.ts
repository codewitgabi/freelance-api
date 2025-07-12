import { User } from "@prisma/client";

export type TUser = Omit<User, "password">;
