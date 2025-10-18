import { Role } from "./enums";

export type RegisterDto = {
  name: string;
  email: string;
  password: string;
  rol: Role;
};
export type LoginDto = {
  email: string;
  password: string;
};
