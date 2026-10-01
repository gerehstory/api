import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WorksModule } from './works/works.module';
import { LikeModule } from './like/like.module';
import { CommentModule } from './comment/comment.module';
import { GenreModule } from './genre/genre.module';
import { SeedsModule } from './seeds/seeds.module';
import { RevisionsModule } from './revisions/revisions.module';
import { StoryTypesModule } from './story-types/story-types.module';
import { AuditModule } from './audit/audit.module';
import { CompetitionsModule } from './competitions/competitions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',

        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),

        ssl: {
          rejectUnauthorized: false,
        },

        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: true,
      }),
    }),
    UsersModule,
    AuthModule,
    WorksModule,
    LikeModule,
    CommentModule,
    GenreModule,
    StoryTypesModule,
    SeedsModule,
    RevisionsModule,
    AuditModule,
    CompetitionsModule,
  ],
})
export class AppModule {}
