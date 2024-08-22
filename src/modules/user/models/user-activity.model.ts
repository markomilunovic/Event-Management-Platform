import { Column, DataType, Model, Table, ForeignKey } from 'sequelize-typescript';
import { User } from './user.model';

@Table({ 
  tableName: 'user_activity',
  timestamps: false
 })
export class UserActivity extends Model<UserActivity> {
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
  })
  action: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  timestamp: Date;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata: any;
}
