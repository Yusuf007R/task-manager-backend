import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { JwtRefreshModule } from './auth/jwt-modules/jwt-refresh.module';
import { JwtAccessModule } from './auth/jwt-modules/jwt-access.module';
import { createConnection } from 'typeorm';
import { MailModule } from './mail/mail.module';
import { HelperModule } from './helper/helper.module';

@Global()
@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: +configService.get<number>('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
      connectionFactory: async (options) => {
        const connection = await createConnection(options);
        const driver = connection.driver as any;
        driver.postgres.defaults.parseInputDatesAsUTC = true;
        driver.postgres.types.setTypeParser(
          1114,
          (str: any) => new Date(str + 'Z'),
        );
        return connection;
      },
    }),
    JwtRefreshModule,
    JwtAccessModule,
    MailModule,
    HelperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
