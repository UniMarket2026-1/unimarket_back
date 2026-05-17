import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Default to SQLite for local development. Set USE_POSTGRES=1 to force Postgres.
    // Print chosen env flags to help debugging local startup
    (() => {
      // eslint-disable-next-line no-console
      console.log('DatabaseModule env:', {
        NODE_ENV: process.env.NODE_ENV,
        USE_POSTGRES: process.env.USE_POSTGRES,
        DATABASE_HOST: process.env.DATABASE_HOST,
      });
      return TypeOrmModule.forRoot(
        process.env.USE_POSTGRES === '1'
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
      );
    })(),
      process.env.USE_POSTGRES === '1'
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
