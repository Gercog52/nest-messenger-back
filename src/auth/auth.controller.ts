import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  HttpException,
  HttpStatus,
  Body,
  Res
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { CreateUserDto, QuickCreateUserDto } from 'src/user/dto/create-user.dto';
import { ERROR_MESSAGES } from 'src/common/ERROR_MESSAGES';
import { AppLogger } from 'src/logger/services/appLogger.service';
import { IAccessToken } from './auth.interface';
import { IreqUser, IsanitiseUser } from 'src/user/interface/user.interface';
import { createRandomString } from 'src/common/randomString';
import { check } from 'src/common/check';

@Controller('auth')
export class AuthController {
  constructor(private authServise: AuthService,
              private userServise: UserService,
              private logger: AppLogger
             ) {}
  @Post('quick-registration')
  async quickRegistration(
    @Body() quickCreateUserDto: QuickCreateUserDto,
  ) {
    const email    = `${createRandomString(10)}@TestEmail.test`;
    const password = createRandomString(10);
    const user = await this.userServise.create(
      {...quickCreateUserDto,email,password}
    )
    const { access_token } = await this.authServise.login(user);

    this.logger
        .log(
          `Reg quick user ${JSON.stringify(this.userServise.sanitiseData(user))}`
        );

    return {...user, access_token, password};
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  @Post('registration')
  async regUser(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userServise.create(createUserDto);
      const { access_token } = await this.authServise.login(user);
      this.logger
          .log(`Reg new user ${JSON.stringify(this.userServise.sanitiseData(user))}`);
      return this.userServise.sanitiseData({...user, access_token});
    } catch {
      throw new HttpException({
        status:   HttpStatus.BAD_REQUEST,
        message:  ERROR_MESSAGES.EMAIL_ALREADY_EXIST,
        error:   'Bad Request'
      }, HttpStatus.BAD_REQUEST);
    }
  };

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: Request & {user: IsanitiseUser}):Promise<IAccessToken> {
    return this.authServise.login(req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: IreqUser):Promise<IsanitiseUser> {
    const user = await this.userServise.getUser({id: req.user.id});
    check(
      !user, 
      "Unauthorized",
      "Incorrect password or email",
      HttpStatus.UNAUTHORIZED
    )
    return this.userServise.sanitiseData(user);
  }
}