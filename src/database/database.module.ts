import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // In development use SQLite to avoid requiring Postgres locally; in production use Postgres.
    TypeOrmModule.forRoot(
      process.env.NODE_ENV === 'production'
        ? {
            type: 'postgres',
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT) || 5432,
            username: process.env.DATABASE_USER || 'postgres',
            password: process.env.DATABASE_PASSWORD || 'postgres',
            database: process.env.DATABASE_NAME || 'unimarket',
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: false,
            dropSchema: false,
          }
        : {
            type: 'sqlite',
            database: process.env.SQLITE_DB_PATH || 'dev.sqlite',
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: false,
          },
    ),
  ],
})
export class DatabaseModule {}
