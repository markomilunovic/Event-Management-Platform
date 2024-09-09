import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

// Ovde fali par stvari...
// Error handling se najbolje radi kroz globalni http exception filter, imate na docsu
// Dodatno, treba enablovati CORS
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
