import { AutoIncrement, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Event } from "src/modules/event/models/event.model";
import { User } from "src/modules/user/models/user.model";

@Table({ tableName: 'ticket' })
export class Ticket extends Model<Ticket> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
    })
    id: number;

    @ForeignKey(() => Event)
    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'event_id'
    })
    eventId: number;

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
        unique: true,
        field: 'QR_code'
    })
    qrCode: string;

}