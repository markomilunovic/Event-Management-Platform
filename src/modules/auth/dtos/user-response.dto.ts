import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/user/models/user.model';

export class UserResponseDto {
  @ApiProperty({ description: 'The unique identifier of the user', example: 1 })
  id: number;

  @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'The email address of the user', example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ description: 'The URL of the user\'s profile picture', example: 'https://example.com/profile.jpg', required: false })
  profilePicture?: string;

  @ApiProperty({ description: 'The role of the user', example: 'admin' })
  role: string;

  @ApiProperty({ description: 'Indicates whether the user is active', example: true })
  isActive: boolean;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.profilePicture = user.profilePicture;
    this.role = user.role;
    this.isActive = user.isActive;
  }
}
