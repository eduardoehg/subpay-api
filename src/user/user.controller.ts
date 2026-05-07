import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create.user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}
  @Post('create-user')
  async create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }
}
