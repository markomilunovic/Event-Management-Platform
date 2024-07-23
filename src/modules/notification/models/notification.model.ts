import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "src/modules/user/models/user.model";

@Table({ tableName: 'notification' })
export class Notification extends Model<Notification> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
    })
    id: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'user_id'
    })
    userId: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'message'
    })
    message: string;

    @Column({
        type: DataType.ENUM('delivered', 'read'),
        allowNull: false,
        field: 'status'
    })
    status: 'delivered' | 'read';

}