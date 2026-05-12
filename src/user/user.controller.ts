import { Body, Controller, Post, Get, Param, Query } from '@nestjs/common';
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
  async getUser(@Param('email') email: string) {
    return this.service.getUser(email);
  }

  @Get('users')
  async getUsers(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.service.getUsers(+page, +limit);
  }
}
