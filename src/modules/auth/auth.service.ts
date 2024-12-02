import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private adminService: AdminService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
        const { password, ...result } = user.toObject();
        return result;
      }
    } catch {
      // 如果用户不存在，尝试验证管理员
      try {
        const admin = await this.adminService.findByUsername(email);
        if (admin && (await bcrypt.compare(password, admin.password))) {
          const { password, ...result } = admin.toObject();
          return { ...result, isAdmin: true };
        }
      } catch {
        return null;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user._id,
      roles: user.roles || ['user'],
      isAdmin: user.isAdmin || false,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
