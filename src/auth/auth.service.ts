import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async login(dto: LoginDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
      select: {
        name: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.password === dto.password) {
      return 'Login susseful';
    }

    throw new NotFoundException('User not found');
  }
}
