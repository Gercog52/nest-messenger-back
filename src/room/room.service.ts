/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable, Logger } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { IjwtUser } from 'src/user/interface/user.interface';
import { DeleteResult, Repository } from 'typeorm';
import { Room } from './room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Role } from 'src/role/role.entity';
import { Message } from 'src/message/message.entity';
import { RoomToUserForRoomM } from 'src/room_user/room_user.forRoomModule.service';
import { RoomQueryService } from './services/room.query.service';
import { check } from 'src/common/check';
import { ERROR_MESSAGES } from 'src/common/ERROR_MESSAGES';
import { RoomCrudService } from './services/room.crud.service';
import { RoomToUser } from 'src/room_user/entity/roomToUser.entity';
import { IRoomWidthRole } from './room.interface';

@Injectable()
export class RoomService {
  private logger = new Logger();

  constructor(@InjectRepository(Room)    private roomRepository: Repository<Room>,
              @InjectRepository(Message) private messageRepository: Repository<Message>,
                                         private roomToUserSeviceRoomM: RoomToUserForRoomM,
                                         private roomCrudService: RoomCrudService,
                                         private roomQueryService: RoomQueryService,
             ) {}

  async create(createRoomDto: CreateRoomDto, jwtUser: IjwtUser) {
    return this.roomCrudService.create({
      ...createRoomDto,
      createrId: jwtUser.id
    });
  }
  async createMessageInRoom(idRoom: number, idUser: number, text: string):Promise<Message> {
    const room = new Room();
          room.id = idRoom;
    const user = new User();
          user.id = idUser;

    const message = this.messageRepository.create({
      room,
      user,
      text
    });

    return this.messageRepository.save(message);
  }
  async joinUser(room: Room, user: User, role: Role):Promise<RoomToUser> {
    return await this.roomToUserSeviceRoomM.joinUser(room,user,role);
  }
  async leaveUser(idRoom: number, idUser: number):Promise<DeleteResult> {
    return await this.roomToUserSeviceRoomM.leaveUser(idRoom,idUser);
  }
  async getUserRooms(idUser:number, isOnliId?: boolean):Promise<Room[]> {
    return await this.roomQueryService.getUserRooms(idUser,isOnliId);
  }
  async getUserRoomsWidthRole(idUser:number):Promise<IRoomWidthRole[]> {
    return await this.roomQueryService.getUserRoomsWidthRole(idUser);
  }
  async findById(id:number):Promise<Room> {
    return await this.roomQueryService.findById(id);
  }
  async checkUniqueName(name: string):Promise<boolean> {
    const isExist = await this.roomQueryService.getCount({name});
    return !isExist;
  }
  async checkUserExistInRoom(idRoom: number, idUser: number):Promise<boolean> {
    return await this.roomToUserSeviceRoomM.checkUniqueRoomToUser(idRoom,idUser);
  }
  async renameRoom(idRoom: number, idUser: number, name: string) {
    const room = await this.roomQueryService.findById(idRoom);
    check(!room, ERROR_MESSAGES.ROOM_NOT_FOUND);
    check(!(await this.checkUniqueName(name)), ERROR_MESSAGES.ROOM_NAME_IS_NOT_UNIQUE);
    check(room.createrId !== idUser, ERROR_MESSAGES.INSUFFICIENT_PRIVILEGES);

    return this.roomCrudService.updateRoom(room, {name});
  }
  async getSimilarRooms(nameRoom: string) {
    return this.roomQueryService.getSimilarRooms(nameRoom);
  }
}
