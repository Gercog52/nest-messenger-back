import { Room } from "src/room/room.entity";
import { Role } from "src/role/role.entity";

export type IRoomWRole = Room & {role: Role}