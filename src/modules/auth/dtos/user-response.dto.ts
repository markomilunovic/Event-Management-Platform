import { User } from 'src/modules/user/models/user.model';

export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  profilePicture?: string;
  role: string;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.profilePicture = user.profilePicture;
    this.role = user.role;
  }
}
