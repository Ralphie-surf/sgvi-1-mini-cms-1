import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/models/user.entity';
import { Role } from 'src/roles/models/role.entity';
import { Tenant } from 'src/tenants/models/tenant.entity';
import { TenantTeam } from 'src/tenants/models/tenant-team';
import { TenantAccountOfficer } from 'src/tenants/models/tenant-account-officer';
import { UsersService } from 'src/users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { JwtCookieBasedStrategy } from './strategies/jwt-cookie-based.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { SessionSerializer } from './serializers/session.serializer';
import { getOpenIdClient, GoogleOidcCustomStrategy } from './strategies/google-oidc.custom.strategy';
import UsersSearchService from 'src/search/services/usersSearch.services';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchModule } from 'src/search/search.module';

/* //Below is not in use because of incompatibility between passport and fastify-session. Replaced by GoogleOidcCustomStrategyFactory
const GoogleOidcStrategyFactory = {
  provide: 'GoogleOidcStrategy',
  useFactory: async (authService: AuthService) => {
    const client = await buildOpenIdClient(); // build the dynamic client before injecting it into the strategy for use in the constructor super call.
    const strategy = new GoogleOidcStrategy(authService, client);
    return strategy;
  },
  inject: [AuthService]
};
*/

const GoogleOidcCustomStrategyFactory = {
  provide: 'GoogleOidcCustomStrategy',
  useFactory: async () => {
    const client = await getOpenIdClient(); // build the dynamic client before injecting it into the strategy for use in the constructor super call.
    const strategy = new GoogleOidcCustomStrategy(client);
    return strategy;
  }
}


@Module({
  imports: [UsersModule, 
    //PassportModule, //alternatively, we can specify default strategy if we have more than one, as done below
    PassportModule.register({ session: true, defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User, Role, Tenant, TenantTeam, TenantAccountOfficer]),
    JwtModule.register({}),
    SearchModule
  ],
  providers: [AuthService, LocalStrategy, UsersService, JwtStrategy,
    JwtCookieBasedStrategy, JwtRefreshTokenStrategy, FacebookStrategy, GoogleOidcCustomStrategyFactory, SessionSerializer,
    UsersSearchService],
  controllers: [AuthController]
})
export class AuthModule {}
