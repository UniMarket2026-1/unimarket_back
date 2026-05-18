import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@/entities/user.entity';
import { Product } from '@/entities/product.entity';
import { Rating } from '@/entities/rating.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Rating)
    private ratingsRepository: Repository<Rating>,
  ) {}

  async seed() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await this.ratingsRepository.clear();
    await this.productsRepository.clear();
    await this.usersRepository.clear();

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = this.usersRepository.create({
      name: 'Admin UniMarket',
      email: 'admin@unimarket.edu',
      password: adminPassword,
      role: 'admin',
      notificationsEnabled: true,
      interests: ['Libros', 'Tecnología'],
      totalRating: 5.0,
      ratingCount: 0,
      profileImageUrl: 'https://i.pravatar.cc/150?u=admin@unimarket.edu',
    });

    // Create test users
    const users = [];
    const userData = [
      { name: 'Maria Garcia', email: 'maria.garcia@universidad.edu' },
      { name: 'Juan Perez', email: 'juan.perez@universidad.edu' },
      { name: 'Carlos Lopez', email: 'carlos.lopez@universidad.edu' },
      { name: 'Sofia Martinez', email: 'sofia.martinez@universidad.edu' },
      { name: 'Roberto Gomez', email: 'roberto.gomez@universidad.edu' },
      { name: 'Ana Maria', email: 'ana.maria@universidad.edu' },
      { name: 'Felipe Leyton', email: 'felipe.leyton@universidad.edu' },
      { name: 'Laura Rodriguez', email: 'laura.rodriguez@universidad.edu' },
    ];

    for (const data of userData) {
      const password = await bcrypt.hash('student123', 10);
      const user = this.usersRepository.create({
        ...data,
        password,
        role: 'student',
        notificationsEnabled: true,
        interests: ['Libros', 'Tecnología', 'Muebles'],
        totalRating: Math.random() * 5,
        ratingCount: Math.floor(Math.random() * 20),
        profileImageUrl: `https://i.pravatar.cc/150?u=${data.email}`,
      });
      users.push(user);
    }

    // Save users
    await this.usersRepository.save(admin);
    const savedUsers = await this.usersRepository.save(users);

    // Create products
    const productData = [
      {
        name: 'Libro Cálculo de Stewart 8va Edición',
        price: 45000,
        description: 'Libro de texto universitario en excelente estado. Ideal para cursos de cálculo. Incluye ejercicios resueltos y apuntes personales.',
        category: 'Libros',
        condition: 'Poco usado',
        conditionDetail: 'Usado durante un semestre. Está forrado en plástico protector. Sin páginas rotas ni manchas. Pequeñas anotaciones en lápiz.',
        imageUrl: 'https://images.unsplash.com/photo-1741795822013-570c944ac5bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        sellerId: savedUsers[0].id,
        latitude: 4.6026 + (Math.random() - 0.5) * 0.05,
        longitude: -74.0655 + (Math.random() - 0.5) * 0.05,
      },
      {
        name: 'Calculadora Científica Casio FX-991LAX',
        price: 35000,
        description: 'Calculadora solar y a batería. Perfecta para ingenierías y ciencias. 650 funciones, pantalla natural.',
        category: 'Tecnología',
        condition: 'Nuevo',
        conditionDetail: 'Nueva en caja sellada. Nunca se ha abierto. Incluye garantía del fabricante.',
        imageUrl: 'https://images.unsplash.com/photo-1761821170104-ccd3e3e21318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        sellerId: savedUsers[1].id,
        latitude: 4.6026 + (Math.random() - 0.5) * 0.05,
        longitude: -74.0655 + (Math.random() - 0.5) * 0.05,
      },
      {
        name: 'Lámpara LED de Escritorio',
        price: 15000,
        description: 'Lámpara con 3 niveles de brillo y control táctil. Cargador USB integrado. Ideal para estudiantes.',
        category: 'Muebles',
        condition: 'Usado',
        conditionDetail: 'Tiene algunos rayones cosméticos pero funciona perfectamente. Todos los botones funcionan correctamente.',
        imageUrl: 'https://images.unsplash.com/photo-1570570665905-346e1b6be193?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        sellerId: savedUsers[2].id,
        latitude: 4.6026 + (Math.random() - 0.5) * 0.05,
        longitude: -74.0655 + (Math.random() - 0.5) * 0.05,
      },
      {
        name: 'Mochilas Ergonómica para Laptop',
        price: 25000,
        description: 'Mochila resistente con compartimento para laptop 15.6". Varios compartimentos de organización.',
        category: 'Ropa',
        condition: 'Poco usado',
        conditionDetail: 'Usado por un semestre solamente. En excelente condición. Sin roturas ni costuras sueltas.',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        sellerId: savedUsers[3].id,
        latitude: 4.6026 + (Math.random() - 0.5) * 0.05,
        longitude: -74.0655 + (Math.random() - 0.5) * 0.05,
      },
      {
        name: 'Monitor Samsung LU28E590DS 28"',
        price: 280000,
        description: '4K UHD, 60Hz, tiempo respuesta 1ms. Excelente para edición de video y gaming. HDMI y DisplayPort.',
        category: 'Tecnología',
        condition: 'Poco usado',
        conditionDetail: 'Comprado hace un año. Funciona perfectamente sin rayones en la pantalla. Incluye todos los cables.',
        imageUrl: 'https://images.unsplash.com/photo-1521298770-1aa500764cbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        sellerId: savedUsers[4].id,
        latitude: 4.6026 + (Math.random() - 0.5) * 0.05,
        longitude: -74.0655 + (Math.random() - 0.5) * 0.05,
      },
      {
        name: 'Escritorio Ajustable en Altura',
        price: 450000,
        description: 'Escritorio motorizado con control eléctrico. Capacidad de carga 100kg. Ideal para home office.',
        category: 'Muebles',
        condition: 'Nuevo',
        conditionDetail: 'Nunca ha sido usado. Viene en caja. Incluye garantía del fabricante por 2 años.',
        imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        sellerId: savedUsers[5].id,
        latitude: 4.6026 + (Math.random() - 0.5) * 0.05,
        longitude: -74.0655 + (Math.random() - 0.5) * 0.05,
      },
      {
        name: 'Apuntes de Programación en Python',
        price: 8000,
        description: 'Apuntes completos del curso de Programación. Incluye ejercicios resueltos y ejemplos prácticos.',
        category: 'Libros',
        condition: 'Poco usado',
        conditionDetail: 'Apuntes manuscritos en cuaderno tamaño carta. Letra clara y organizada. Sin hojas sueltas.',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        sellerId: savedUsers[6].id,
        latitude: 4.6026 + (Math.random() - 0.5) * 0.05,
        longitude: -74.0655 + (Math.random() - 0.5) * 0.05,
      },
      {
        name: 'Teclado Mecánico RGB',
        price: 120000,
        description: 'Teclado mecánico con switches RGB. Macro programmable. Perfecto para gaming y programación.',
        category: 'Tecnología',
        condition: 'Poco usado',
        conditionDetail: 'Usado por 3 meses solamente. Todas las teclas funcionan correctamente. Cables en excelente estado.',
        imageUrl: 'https://images.unsplash.com/photo-1587829191301-5f5f82c14a7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        sellerId: savedUsers[7].id,
      },
    ];

    const products = productData.map(data => 
      this.productsRepository.create(data)
    );

    const savedProducts = await this.productsRepository.save(products);

    // Create ratings
    const ratings = [
      {
        sellerId: savedUsers[0].id,
        buyerId: savedUsers[1].id,
        productId: savedProducts[0].id,
        rating: 5,
        comment: 'Excelente vendedor. El libro llegó en perfecto estado. Muy recomendado.',
      },
      {
        sellerId: savedUsers[1].id,
        buyerId: savedUsers[2].id,
        productId: savedProducts[1].id,
        rating: 4,
        comment: 'Buena transacción. El producto llegó como se describió.',
      },
      {
        sellerId: savedUsers[2].id,
        buyerId: savedUsers[3].id,
        productId: savedProducts[2].id,
        rating: 5,
        comment: 'La lámpara funciona muy bien. Entrega rápida.',
      },
      {
        sellerId: savedUsers[3].id,
        buyerId: savedUsers[0].id,
        productId: savedProducts[3].id,
        rating: 4,
        comment: 'Mochila de buena calidad. Un poco más pequeña de lo esperado.',
      },
    ];

    for (const ratingData of ratings) {
      const rating = this.ratingsRepository.create(ratingData);
      await this.ratingsRepository.save(rating);

      // Update seller rating
      const seller = await this.usersRepository.findOne({
        where: { id: ratingData.sellerId },
      });
      if (seller) {
        const sellerRatings = await this.ratingsRepository.find({
          where: { sellerId: ratingData.sellerId },
        });
        seller.totalRating = 
          sellerRatings.reduce((sum, r) => sum + r.rating, 0) / sellerRatings.length;
        seller.ratingCount = sellerRatings.length;
        await this.usersRepository.save(seller);
      }
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@unimarket.edu / admin123');
    console.log('Student: maria.garcia@universidad.edu / student123');
    console.log(`\n📊 Data Created:`);
    console.log(`- ${savedUsers.length + 1} Users`);
    console.log(`- ${savedProducts.length} Products`);
    console.log(`- ${ratings.length} Ratings`);
  }
}
