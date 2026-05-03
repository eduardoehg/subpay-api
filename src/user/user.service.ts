import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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
      data: dto,
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
