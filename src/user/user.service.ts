import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create.user.dto/create.user.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async create(dto: CreateUserDto) {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (userAlreadyExists) {
      throw new ConflictException('User already exists');
    }

    const user = await this.prismaService.user.create({
      data: {
        ...dto,
        roleId: 1,
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
      },
    });

    return user;
  }
}
