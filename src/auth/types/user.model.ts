import { RoleEnum } from '../../users/enums/role.enum';

export type UserPayloadModel = {
  sub: number;
  role: RoleEnum;
  phone?: string;
};
