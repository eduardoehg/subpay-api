import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService
  ) {}

  private async generateAndPersistTokens(userId: number, email: string) {
    const payload = {
      sub: userId,
      email: email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '15d',
    });

    const { exp } = this.jwtService.decode(refreshToken);
    const expiresAt = new Date(exp * 1000);

    const hashRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prismaService.refreshToken.create({
      data: {
        userId: userId,
        tokenHash: hashRefreshToken,
        expiresAt: expiresAt,
      },
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async login(dto: LoginDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.generateAndPersistTokens(user.id, user.email);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const storedTokens = await this.prismaService.refreshToken.findMany({
        where: {
          userId: payload.sub,
          revoked: false,
        },
        select: {
          tokenHash: true,
        },
      });

      let isTokenValid = false;

      for (const storedToken of storedTokens) {
        const matches = await bcrypt.compare(
          refreshToken,
          storedToken.tokenHash
        );

        if (matches) {
          isTokenValid = true;
          break;
        }
      }

      if (!isTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = {
        sub: payload.sub,
        email: payload.email,
      };

      const accessToken = await this.jwtService.signAsync(newPayload);

      return accessToken;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(dto: RegisterDto) {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (userAlreadyExists) {
      throw new ConflictException('User already exists');
    }

    dto.password = await bcrypt.hash(dto.password, 10);

    const user = await this.prismaService.user.create({
      data: {
        ...dto,
        roleId: 1,
      },
      select: {
        id: true,
        email: true,
      },
    });

    return await this.generateAndPersistTokens(user.id, user.email);
  }

  async logout(userId: number) {
    await this.prismaService.refreshToken.updateMany({
      where: {
        userId: userId,
      },
      data: {
        revoked: true,
      },
    });

    return { message: 'Logout Successful' };
  }
}
