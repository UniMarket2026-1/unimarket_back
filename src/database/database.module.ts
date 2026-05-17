import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Use SQLite when USE_SQLITE=1, otherwise use Postgres when DATABASE_HOST is provided; fallback to SQLite.
    TypeOrmModule.forRoot(
      process.env.USE_SQLITE === '1' || !process.env.DATABASE_HOST
        ? {
            type: 'sqlite',
            database: process.env.SQLITE_DB_PATH || 'dev.sqlite',
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: false,
          }
        : {
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
          },
    ),
  ],
})
export class DatabaseModule {}
