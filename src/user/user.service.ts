import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create.user.dto';

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

  async getUser(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
      select: {
        name: true,
        email: true,
        roleId: true,
        status: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const users = await this.prismaService.user.findMany({
      skip,
      select: {
        name: true,
        email: true,
        roleId: true,
        status: true,
      },
      take: limit,
    });

    return users;
  }
}
