import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create.user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}
  @Post('create-user')
  async create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  @Get('get-user/:email')
  async get(@Param('email') email: string) {
    return this.service.getUser(email);
  }
}
