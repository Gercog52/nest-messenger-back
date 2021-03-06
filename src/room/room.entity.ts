/* eslint-disable @typescript-eslint/no-unused-vars */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { RoomToUser } from "src/room_user/entity/roomToUser.entity";
import { Role } from "src/role/role.entity";
import { Message } from "src/message/message.entity";

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number

  @Column({nullable: false, unique: true})
  name: string

  @Column({nullable: false})
  createrId: number

  @Column({default: null})
  avatarId?: string

  @OneToMany(type => Message, message => message.room)
  messages: Message[]

  @OneToMany(type => Role, role => role.room)
  roomRoles: Role[]

  @OneToMany(type => RoomToUser, roomToUser => roomToUser.room)
  roomToUsers: RoomToUser[]
}