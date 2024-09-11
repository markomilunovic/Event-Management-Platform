import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'ticket' })
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'event_id' })
  eventId: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', unique: true, name: 'QR_code' })
  qrCode: string;

  @Column({ type: 'boolean', default: false, name: 'checked_in' })
  checkedIn: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Event, (event) => event.tickets, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, (user) => user.tickets, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
