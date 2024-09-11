import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AccessToken } from '../../auth/entities/access-token.entity';
import { Event } from '../../event/entities/event.entity'; 
import { UserActivity } from './user-activity.entity';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { Notification } from '../../notification/entities/notification.entities';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'varchar', nullable: true, name: 'profile_picture' })
  profilePicture: string;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => AccessToken, (accessToken) => accessToken.user)
  accessTokens: AccessToken[];

  @OneToMany(() => Event, (event) => event.user)
  events: Event[];

  @OneToMany(() => UserActivity, (userActivity) => userActivity.user)
  activities: UserActivity[];

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
