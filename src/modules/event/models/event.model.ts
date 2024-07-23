import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: 'event' })
export class Event extends Model<Event> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true
    })
    id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'title'
    })
    title: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'descrtiption'
    })
    description: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'location'
    })
    location: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'date'
    })
    date: string

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'time'
    })
    time: Date;
}