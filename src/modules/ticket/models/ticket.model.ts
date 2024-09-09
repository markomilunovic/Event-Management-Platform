import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { Event } from '@modules/event/models/event.model';
import { User } from '@modules/user/models/user.model';

@Table({ tableName: 'ticket' })
export class Ticket extends Model<Ticket> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => Event)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'event_id',
  })
  eventId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  userId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    field: 'QR_code',
  })
  qrCode: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'checked_in',
  })
  checkedIn: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'created_at',
  })
  createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'updated_at',
  })
  updatedAt: Date;
}
