import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  try {
    // Clear existing data
    await prisma.inventoryRecord.deleteMany();
    await prisma.merchVariant.deleteMany();
    await prisma.merchItem.deleteMany();
    await prisma.show.deleteMany();
    await prisma.tour.deleteMany();
    await prisma.user.deleteMany();

    console.log('🧹 Cleared existing data');

    // Create users with proper Auth0 IDs
    const manager = await prisma.user.create({
      data: {
        auth0Id: 'auth0|691f989d2bc713054fec2340',
        email: 'manager@test.com',
        name: 'Tour Manager',
        role: 'MANAGER'
      }
    });

    await prisma.user.create({
      data: {
        auth0Id: 'auth0|691f98c8b7368a8df0744c61',
        email: 'seller@test.com',
        name: 'Tour Seller',
        role: 'SELLER'
      }
    });

    console.log('👤 Created users');

    // Create 4 comprehensive tours
    const tours = await Promise.all([
      // Current active tour
      prisma.tour.create({
        data: {
          name: 'Summer World Tour 2024',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-09-30'),
          isActive: true,
          managerId: manager.id
        }
      }),
      // Past completed tour
      prisma.tour.create({
        data: {
          name: 'Spring European Tour 2024',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-05-15'),
          isActive: false,
          managerId: manager.id
        }
      }),
      // Past completed tour (older)
      prisma.tour.create({
        data: {
          name: 'Fall Australia & Asia Tour 2023',
          startDate: new Date('2023-09-01'),
          endDate: new Date('2023-11-30'),
          isActive: false,
          managerId: manager.id
        }
      }),
      // Active future tour
      prisma.tour.create({
        data: {
          name: 'Winter Holiday Tour 2024-2026',
          startDate: new Date('2024-12-01'),
          endDate: new Date('2026-11-30'),
          isActive: true,
          managerId: manager.id
        }
      })
    ]);

    const [summerTour, springTour, fallTour, winterTour] = tours;

    console.log('🎵 Created 4 tours');

    // Create comprehensive shows (5+ per tour)
    const summerShows = await Promise.all([
      prisma.show.create({
        data: {
          name: 'London - The O2 Arena',
          date: new Date('2024-06-15T20:00:00Z'),
          venue: 'The O2 Arena',
          ticketsSold: 18500,
          totalTickets: 20000,
          cost: 150000.00,
          currency: 'GBP',
          tourId: summerTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'Paris - AccorHotels Arena',
          date: new Date('2024-06-18T20:00:00Z'),
          venue: 'AccorHotels Arena',
          ticketsSold: 15200,
          totalTickets: 16500,
          cost: 125000.00,
          currency: 'EUR',
          tourId: summerTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'Berlin - Mercedes-Benz Arena',
          date: new Date('2024-06-22T20:00:00Z'),
          venue: 'Mercedes-Benz Arena',
          ticketsSold: 16800,
          totalTickets: 17000,
          cost: 140000.00,
          currency: 'EUR',
          tourId: summerTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'New York - Madison Square Garden',
          date: new Date('2024-07-02T20:00:00Z'),
          venue: 'Madison Square Garden',
          ticketsSold: 19800,
          totalTickets: 20000,
          cost: 200000.00,
          currency: 'USD',
          tourId: summerTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'Los Angeles - Crypto.com Arena',
          date: new Date('2024-08-05T20:00:00Z'),
          venue: 'Crypto.com Arena',
          ticketsSold: 18200,
          totalTickets: 21000,
          cost: 220000.00,
          currency: 'USD',
          tourId: summerTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'Toronto - Scotiabank Arena',
          date: new Date('2024-08-10T20:00:00Z'),
          venue: 'Scotiabank Arena',
          ticketsSold: null, // Future show
          totalTickets: 19800,
          cost: 180000.00,
          currency: 'CAD',
          tourId: summerTour.id
        }
      })
    ]);

    const springShows = await Promise.all([
      prisma.show.create({
        data: {
          name: 'Barcelona - Sant Jordi',
          date: new Date('2024-03-15T20:00:00Z'),
          venue: 'Palau de la Música Catalana',
          ticketsSold: 8500,
          totalTickets: 9000,
          cost: 85000.00,
          currency: 'EUR',
          tourId: springTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'Amsterdam - Ziggo Dome',
          date: new Date('2024-04-02T20:00:00Z'),
          venue: 'Ziggo Dome',
          ticketsSold: 16800,
          totalTickets: 17000,
          cost: 140000.00,
          currency: 'EUR',
          tourId: springTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'Prague - O2 Arena',
          date: new Date('2024-04-08T20:00:00Z'),
          venue: 'O2 Arena Prague',
          ticketsSold: 14200,
          totalTickets: 15000,
          cost: 120000.00,
          currency: 'CZK',
          tourId: springTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'Vienna - Wiener Stadthalle',
          date: new Date('2024-04-12T20:00:00Z'),
          venue: 'Wiener Stadthalle',
          ticketsSold: 15500,
          totalTickets: 16000,
          cost: 130000.00,
          currency: 'EUR',
          tourId: springTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'Budapest - Papp László Arena',
          date: new Date('2024-04-15T20:00:00Z'),
          venue: 'Papp László Sportaréna',
          ticketsSold: 11800,
          totalTickets: 12500,
          cost: 95000.00,
          currency: 'HUF',
          tourId: springTour.id
        }
      })
    ]);

    const fallShows = await Promise.all([
      prisma.show.create({
        data: {
          name: 'Sydney - Qudos Bank Arena',
          date: new Date('2023-10-15T20:00:00Z'),
          venue: 'Qudos Bank Arena',
          ticketsSold: 19500,
          totalTickets: 21000,
          cost: 180000.00,
          currency: 'AUD',
          tourId: fallTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'Melbourne - Rod Laver Arena',
          date: new Date('2023-10-18T20:00:00Z'),
          venue: 'Rod Laver Arena',
          ticketsSold: 15200,
          totalTickets: 15000,
          cost: 160000.00,
          currency: 'AUD',
          tourId: fallTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'Tokyo - Tokyo Dome',
          date: new Date('2023-10-25T19:00:00Z'),
          venue: 'Tokyo Dome',
          ticketsSold: 55000,
          totalTickets: 55000,
          cost: 500000.00,
          currency: 'JPY',
          tourId: fallTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'Osaka - Kyocera Dome',
          date: new Date('2023-10-28T19:00:00Z'),
          venue: 'Kyocera Dome Osaka',
          ticketsSold: 38000,
          totalTickets: 40000,
          cost: 350000.00,
          currency: 'JPY',
          tourId: fallTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'Seoul - KSPO Dome',
          date: new Date('2023-11-02T19:00:00Z'),
          venue: 'Olympic Gymnastics Arena',
          ticketsSold: 14800,
          totalTickets: 15000,
          cost: 200000.00,
          currency: 'KRW',
          tourId: fallTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'Bangkok - Impact Arena',
          date: new Date('2023-11-05T20:00:00Z'),
          venue: 'Impact Arena, Muang Thong Thani',
          ticketsSold: 12500,
          totalTickets: 13000,
          cost: 150000.00,
          currency: 'THB',
          tourId: fallTour.id
        }
      })
    ]);

    const winterShows = await Promise.all([
      prisma.show.create({
        data: {
          name: 'Las Vegas - T-Mobile Arena',
          date: new Date('2024-12-20T21:00:00Z'),
          venue: 'T-Mobile Arena',
          ticketsSold: null, // Future show
          totalTickets: 20000,
          cost: 400000.00,
          currency: 'USD',
          tourId: winterTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'Phoenix - Footprint Center',
          date: new Date('2024-12-23T20:00:00Z'),
          venue: 'Footprint Center',
          ticketsSold: null, // Future show
          totalTickets: 18400,
          cost: 300000.00,
          currency: 'USD',
          tourId: winterTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'Denver - Ball Arena',
          date: new Date('2024-12-28T20:00:00Z'),
          venue: 'Ball Arena',
          ticketsSold: null, // Future show
          totalTickets: 20000,
          cost: 350000.00,
          currency: 'USD',
          tourId: winterTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'Chicago - United Center',
          date: new Date('2025-01-02T20:00:00Z'),
          venue: 'United Center',
          ticketsSold: null, // Future show
          totalTickets: 23500,
          cost: 450000.00,
          currency: 'USD',
          tourId: winterTour.id
        }
      }),
      prisma.show.create({
        data: {
          name: 'Boston - TD Garden',
          date: new Date('2025-01-05T20:00:00Z'),
          venue: 'TD Garden',
          ticketsSold: null, // Future show
          totalTickets: 19600,
          cost: 380000.00,
          currency: 'USD',
          tourId: winterTour.id
        }
      })
    ]);

    console.log(`🎪 Created shows: ${summerShows.length + springShows.length + fallShows.length + winterShows.length} total`);

    // Create comprehensive merchandise with realistic image URLs
    // Summer tour merch (unisex)
    const summerTshirt = await prisma.merchItem.create({
      data: {
        name: 'Summer World Tour 2024 T-Shirt',
        description: 'Official unisex tour t-shirt with city-specific designs and tour dates',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center',
        tourId: summerTour.id
      }
    });

    const summerHoodie = await prisma.merchItem.create({
      data: {
        name: 'Summer Tour Hoodie',
        description: 'Premium cotton blend hoodie with embroidered tour logo',
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&crop=center',
        tourId: summerTour.id
      }
    });

    const summerPoster = await prisma.merchItem.create({
      data: {
        name: 'Summer Concert Poster',
        description: 'Limited edition holographic concert poster',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center',
        tourId: summerTour.id
      }
    });

    // Spring tour merch (male/female variants)
    const springMensShirt = await prisma.merchItem.create({
      data: {
        name: "Men's European Tour Shirt",
        description: 'Tailored fit men\'s shirt with European flag design',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop&crop=center',
        tourId: springTour.id
      }
    });

    const springWomensShirt = await prisma.merchItem.create({
      data: {
        name: "Women's European Tour Shirt",
        description: 'Fitted women\'s shirt with floral European motif',
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop&crop=center',
        tourId: springTour.id
      }
    });

    const springToteBag = await prisma.merchItem.create({
      data: {
        name: 'European Tour Tote Bag',
        description: 'Canvas tote bag with tour cities map',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
        tourId: springTour.id
      }
    });

    // Fall tour merch (male/female variants)
    const fallMensShirt = await prisma.merchItem.create({
      data: {
        name: "Men's Asia Pacific Tour Tee",
        description: 'Men\'s shirt featuring Asian-inspired artwork',
        imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop&crop=center',
        tourId: fallTour.id
      }
    });

    const fallWomensShirt = await prisma.merchItem.create({
      data: {
        name: "Women's Asia Pacific Tour Tee",
        description: 'Women\'s fitted tee with cherry blossom design',
        imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&crop=center',
        tourId: fallTour.id
      }
    });

    const fallCap = await prisma.merchItem.create({
      data: {
        name: 'Asia Pacific Tour Snapback',
        description: 'Embroidered snapback cap with Japanese script',
        imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop&crop=center',
        tourId: fallTour.id
      }
    });

    const fallVinyl = await prisma.merchItem.create({
      data: {
        name: 'Live in Tokyo Vinyl',
        description: 'Limited edition live recording from Tokyo Dome',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center',
        tourId: fallTour.id
      }
    });

    // Winter tour merch (unisex holiday themed)
    const winterHolidayShirt = await prisma.merchItem.create({
      data: {
        name: 'Holiday Tour Long Sleeve',
        description: 'Festive long sleeve shirt with holiday tour artwork',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center',
        tourId: winterTour.id
      }
    });

    const winterScarf = await prisma.merchItem.create({
      data: {
        name: 'Winter Tour Knit Scarf',
        description: 'Warm knit scarf with tour logo embroidery',
        imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=400&fit=crop&crop=center',
        tourId: winterTour.id
      }
    });

    console.log('👕 Created merchandise items with images');

    // Create comprehensive variants
    // Summer tour variants (unisex)
    const summerTshirtVariants = await Promise.all([
      prisma.merchVariant.create({
        data: { size: 'XS', type: 'Unisex', price: 25.00, quantity: 15, merchItemId: summerTshirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'S', type: 'Unisex', price: 25.00, quantity: 15, merchItemId: summerTshirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'M', type: 'Unisex', price: 25.00, quantity: 30, merchItemId: summerTshirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'L', type: 'Unisex', price: 25.00, quantity: 25, merchItemId: summerTshirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'XL', type: 'Unisex', price: 25.00, quantity: 20, merchItemId: summerTshirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'XXL', type: 'Unisex', price: 27.00, quantity: 10, merchItemId: summerTshirt.id }
      })
    ]);

    const summerHoodieVariants = await Promise.all([
      prisma.merchVariant.create({
        data: { size: 'S', type: 'Unisex', price: 45.00, quantity: 10, merchItemId: summerHoodie.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'M', type: 'Unisex', price: 45.00, quantity: 20, merchItemId: summerHoodie.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'L', type: 'Unisex', price: 45.00, quantity: 18, merchItemId: summerHoodie.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'XL', type: 'Unisex', price: 45.00, quantity: 15, merchItemId: summerHoodie.id }
      })
    ]);

    const summerPosterVariant = await prisma.merchVariant.create({
      data: { size: 'One Size', type: null, price: 15.00, quantity: 50, merchItemId: summerPoster.id }
    });

    // Spring tour variants (male/female)
    const springMensVariants = await Promise.all([
      prisma.merchVariant.create({
        data: { size: 'S', type: 'Mens', price: 28.00, quantity: 0, merchItemId: springMensShirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'M', type: 'Mens', price: 28.00, quantity: 2, merchItemId: springMensShirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'L', type: 'Mens', price: 28.00, quantity: 1, merchItemId: springMensShirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'XL', type: 'Mens', price: 28.00, quantity: 0, merchItemId: springMensShirt.id }
      })
    ]);

    const springWomensVariants = await Promise.all([
      prisma.merchVariant.create({
        data: { size: 'XS', type: 'Womens', price: 26.00, quantity: 1, merchItemId: springWomensShirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'S', type: 'Womens', price: 26.00, quantity: 0, merchItemId: springWomensShirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'M', type: 'Womens', price: 26.00, quantity: 3, merchItemId: springWomensShirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'L', type: 'Womens', price: 26.00, quantity: 1, merchItemId: springWomensShirt.id }
      })
    ]);

    const springToteVariant = await prisma.merchVariant.create({
      data: { size: 'One Size', type: null, price: 18.00, quantity: 8, merchItemId: springToteBag.id }
    });

    // Fall tour variants (male/female)
    const fallMensVariants = await Promise.all([
      prisma.merchVariant.create({
        data: { size: 'S', type: 'Mens', price: 30.00, quantity: 0, merchItemId: fallMensShirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'M', type: 'Mens', price: 30.00, quantity: 0, merchItemId: fallMensShirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'L', type: 'Mens', price: 30.00, quantity: 0, merchItemId: fallMensShirt.id }
      })
    ]);

    const fallWomensVariants = await Promise.all([
      prisma.merchVariant.create({
        data: { size: 'XS', type: 'Womens', price: 30.00, quantity: 0, merchItemId: fallWomensShirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'S', type: 'Womens', price: 30.00, quantity: 1, merchItemId: fallWomensShirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'M', type: 'Womens', price: 30.00, quantity: 0, merchItemId: fallWomensShirt.id }
      })
    ]);

    const fallCapVariant = await prisma.merchVariant.create({
      data: { size: 'One Size', type: null, price: 35.00, quantity: 2, merchItemId: fallCap.id }
    });

    const fallVinylVariant = await prisma.merchVariant.create({
      data: { size: 'One Size', type: null, price: 40.00, quantity: 15, merchItemId: fallVinyl.id }
    });

    // Winter tour variants (full stock - future tour)
    const winterShirtVariants = await Promise.all([
      prisma.merchVariant.create({
        data: { size: 'S', type: 'Unisex', price: 32.00, quantity: 50, merchItemId: winterHolidayShirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'M', type: 'Unisex', price: 32.00, quantity: 75, merchItemId: winterHolidayShirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'L', type: 'Unisex', price: 32.00, quantity: 60, merchItemId: winterHolidayShirt.id }
      }),
      prisma.merchVariant.create({
        data: { size: 'XL', type: 'Unisex', price: 32.00, quantity: 40, merchItemId: winterHolidayShirt.id }
      })
    ]);

    const winterScarfVariant = await prisma.merchVariant.create({
      data: { size: 'One Size', type: null, price: 25.00, quantity: 100, merchItemId: winterScarf.id }
    });

    console.log('📐 Created comprehensive variants (male/female options included)');

    // Create inventory records with sales AND shrinkage/loss
    console.log('📊 Creating inventory records with progression to show shrinkage...');

    // Summer tour inventory (active tour with detailed progression showing shrinkage between shows)
    // Tracking T-shirt S variant across shows with shrinkage
    await Promise.all([
      // Show 1 (London) - T-shirt S: Start 30, sell 5, end 24 (1 lost)
      prisma.inventoryRecord.create({
        data: {
          startCount: 30, endCount: 24, addedCount: 0, soldCount: 5,
          showId: summerShows[0].id, variantId: summerTshirtVariants[1].id // S
        }
      }),
      // Show 2 (Paris) - Start 22 (2 lost between shows), sell 4, end 17 (1 lost)
      prisma.inventoryRecord.create({
        data: {
          startCount: 22, endCount: 17, addedCount: 0, soldCount: 4,
          showId: summerShows[1].id, variantId: summerTshirtVariants[1].id // S
        }
      }),
      // Show 3 (Berlin) - Start 15 (2 lost between shows), sell 3, end 11 (1 lost)
      prisma.inventoryRecord.create({
        data: {
          startCount: 15, endCount: 11, addedCount: 0, soldCount: 3,
          showId: summerShows[2].id, variantId: summerTshirtVariants[1].id // S
        }
      }),
      // Show 4 (NY) - Start 9 (2 lost between shows), sell 2, end 6 (1 lost)
      prisma.inventoryRecord.create({
        data: {
          startCount: 9, endCount: 6, addedCount: 0, soldCount: 2,
          showId: summerShows[3].id, variantId: summerTshirtVariants[1].id // S
        }
      }),
      // Show 5 (LA) - Start 4 (2 lost between shows), sell 1, end 2 (1 lost)
      prisma.inventoryRecord.create({
        data: {
          startCount: 4, endCount: 2, addedCount: 0, soldCount: 1,
          showId: summerShows[4].id, variantId: summerTshirtVariants[1].id // S
        }
      })
    ]);

    // T-shirt M variant progression with shrinkage
    await Promise.all([
      // London: Start 50, sell 8, end 40 (2 lost)
      prisma.inventoryRecord.create({
        data: {
          startCount: 50, endCount: 40, addedCount: 0, soldCount: 8,
          showId: summerShows[0].id, variantId: summerTshirtVariants[2].id // M
        }
      }),
      // Paris: Start 37 (3 lost between shows), sell 7, end 28 (2 lost)
      prisma.inventoryRecord.create({
        data: {
          startCount: 37, endCount: 28, addedCount: 0, soldCount: 7,
          showId: summerShows[1].id, variantId: summerTshirtVariants[2].id // M
        }
      }),
      // Berlin: Start 26 (2 lost between shows), sell 6, end 18 (2 lost)
      prisma.inventoryRecord.create({
        data: {
          startCount: 26, endCount: 18, addedCount: 0, soldCount: 6,
          showId: summerShows[2].id, variantId: summerTshirtVariants[2].id // M
        }
      }),
      // NY: Start 16 (2 lost between shows), sell 4, end 11 (1 lost)
      prisma.inventoryRecord.create({
        data: {
          startCount: 16, endCount: 11, addedCount: 0, soldCount: 4,
          showId: summerShows[3].id, variantId: summerTshirtVariants[2].id // M
        }
      }),
      // LA: Start 9 (2 lost between shows), sell 3, end 5 (1 lost)
      prisma.inventoryRecord.create({
        data: {
          startCount: 9, endCount: 5, addedCount: 0, soldCount: 3,
          showId: summerShows[4].id, variantId: summerTshirtVariants[2].id // M
        }
      })
    ]);

    // Hoodie progression with shrinkage
    await Promise.all([
      // London: Start 25, sell 3, end 21 (1 lost)
      prisma.inventoryRecord.create({
        data: {
          startCount: 25, endCount: 21, addedCount: 0, soldCount: 3,
          showId: summerShows[0].id, variantId: summerHoodieVariants[1].id // M
        }
      }),
      // Paris: Start 19 (2 lost between shows), sell 2, end 16 (1 lost)
      prisma.inventoryRecord.create({
        data: {
          startCount: 19, endCount: 16, addedCount: 0, soldCount: 2,
          showId: summerShows[1].id, variantId: summerHoodieVariants[1].id // M
        }
      }),
      // Berlin: Start 14 (2 lost between shows), sell 2, end 11 (1 lost)
      prisma.inventoryRecord.create({
        data: {
          startCount: 14, endCount: 11, addedCount: 0, soldCount: 2,
          showId: summerShows[2].id, variantId: summerHoodieVariants[1].id // M
        }
      })
    ]);

    // Spring tour inventory - Sequential records to show shrinkage between shows
    console.log('📊 Creating Spring tour sequential inventory with shrinkage...');
    
    // Men's M shirts progression across all shows with shrinkage
    await Promise.all([
      // Barcelona: Start 25, sell 4, end 19 (2 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 25, endCount: 19, addedCount: 0, soldCount: 4, showId: springShows[0].id, variantId: springMensVariants[1].id }
      }),
      // Amsterdam: Start 17 (2 lost), sell 5, end 11 (1 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 17, endCount: 11, addedCount: 0, soldCount: 5, showId: springShows[1].id, variantId: springMensVariants[1].id }
      }),
      // Prague: Start 9 (2 lost), sell 3, end 5 (1 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 9, endCount: 5, addedCount: 0, soldCount: 3, showId: springShows[2].id, variantId: springMensVariants[1].id }
      }),
      // Vienna: Start 3 (2 lost), sell 2, end 0 (1 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 3, endCount: 0, addedCount: 0, soldCount: 2, showId: springShows[3].id, variantId: springMensVariants[1].id }
      })
    ]);

    // Women's M shirts progression with shrinkage
    await Promise.all([
      // Barcelona: Start 20, sell 3, end 16 (1 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 20, endCount: 16, addedCount: 0, soldCount: 3, showId: springShows[0].id, variantId: springWomensVariants[2].id }
      }),
      // Amsterdam: Start 14 (2 lost), sell 4, end 9 (1 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 14, endCount: 9, addedCount: 0, soldCount: 4, showId: springShows[1].id, variantId: springWomensVariants[2].id }
      }),
      // Prague: Start 7 (2 lost), sell 2, end 4 (1 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 7, endCount: 4, addedCount: 0, soldCount: 2, showId: springShows[2].id, variantId: springWomensVariants[2].id }
      }),
      // Vienna: Start 2 (2 lost), sell 1, end 0 (1 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 2, endCount: 0, addedCount: 0, soldCount: 1, showId: springShows[3].id, variantId: springWomensVariants[2].id }
      })
    ]);

    // Tote bags progression with shrinkage
    await Promise.all([
      // Barcelona: Start 30, sell 5, end 23 (2 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 30, endCount: 23, addedCount: 0, soldCount: 5, showId: springShows[0].id, variantId: springToteVariant.id }
      }),
      // Amsterdam: Start 20 (3 lost), sell 4, end 15 (1 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 20, endCount: 15, addedCount: 0, soldCount: 4, showId: springShows[1].id, variantId: springToteVariant.id }
      }),
      // Prague: Start 13 (2 lost), sell 3, end 9 (1 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 13, endCount: 9, addedCount: 0, soldCount: 3, showId: springShows[2].id, variantId: springToteVariant.id }
      })
    ]);

    // Fall tour inventory - Sequential records to show shrinkage between shows
    console.log('📊 Creating Fall tour sequential inventory with shrinkage...');

    // Men's M shirts progression across shows with shrinkage
    await Promise.all([
      // Sydney: Start 30, sell 6, end 22 (2 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 30, endCount: 22, addedCount: 0, soldCount: 6, showId: fallShows[0].id, variantId: fallMensVariants[1].id }
      }),
      // Melbourne: Start 19 (3 lost), sell 8, end 9 (2 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 19, endCount: 9, addedCount: 0, soldCount: 8, showId: fallShows[1].id, variantId: fallMensVariants[1].id }
      }),
      // Tokyo: Start 6 (3 lost), add 50, sell 25, end 29 (2 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 6, endCount: 29, addedCount: 50, soldCount: 25, showId: fallShows[2].id, variantId: fallMensVariants[1].id }
      }),
      // Osaka: Start 26 (3 lost), sell 15, end 9 (2 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 26, endCount: 9, addedCount: 0, soldCount: 15, showId: fallShows[3].id, variantId: fallMensVariants[1].id }
      }),
      // Seoul: Start 6 (3 lost), sell 4, end 1 (1 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 6, endCount: 1, addedCount: 0, soldCount: 4, showId: fallShows[4].id, variantId: fallMensVariants[1].id }
      })
    ]);

    // Caps progression with shrinkage
    await Promise.all([
      // Sydney: Start 40, sell 8, end 30 (2 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 40, endCount: 30, addedCount: 0, soldCount: 8, showId: fallShows[0].id, variantId: fallCapVariant.id }
      }),
      // Melbourne: Start 27 (3 lost), sell 5, end 21 (1 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 27, endCount: 21, addedCount: 0, soldCount: 5, showId: fallShows[1].id, variantId: fallCapVariant.id }
      }),
      // Tokyo: Start 18 (3 lost), sell 12, end 4 (2 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 18, endCount: 4, addedCount: 0, soldCount: 12, showId: fallShows[2].id, variantId: fallCapVariant.id }
      }),
      // Osaka: Start 1 (3 lost), sell 1, end 0
      prisma.inventoryRecord.create({
        data: { startCount: 1, endCount: 0, addedCount: 0, soldCount: 1, showId: fallShows[3].id, variantId: fallCapVariant.id }
      })
    ]);

    // Vinyl progression with shrinkage
    await Promise.all([
      // Tokyo: Start 60, sell 15, end 42 (3 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 60, endCount: 42, addedCount: 0, soldCount: 15, showId: fallShows[2].id, variantId: fallVinylVariant.id }
      }),
      // Osaka: Start 39 (3 lost), sell 10, end 27 (2 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 39, endCount: 27, addedCount: 0, soldCount: 10, showId: fallShows[3].id, variantId: fallVinylVariant.id }
      }),
      // Seoul: Start 24 (3 lost), sell 8, end 14 (2 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 24, endCount: 14, addedCount: 0, soldCount: 8, showId: fallShows[4].id, variantId: fallVinylVariant.id }
      }),
      // Bangkok: Start 11 (3 lost), sell 4, end 6 (1 lost)
      prisma.inventoryRecord.create({
        data: { startCount: 11, endCount: 6, addedCount: 0, soldCount: 4, showId: fallShows[5].id, variantId: fallVinylVariant.id }
      })
    ]);

    // Winter tour inventory (NO SALES - future tour, but add lost items from prep/transport)
    console.log('📦 Adding winter tour inventory with lost items (no sales)...');
    
    const winterInventoryData = [
      // Pre-tour inventory shipment losses during transport/setup
      { startCount: 50, endCount: 47, addedCount: 0, soldCount: 0, showId: winterShows[0].id, variantId: winterShirtVariants[0].id }, // S - 3 lost in transit
      { startCount: 75, endCount: 73, addedCount: 0, soldCount: 0, showId: winterShows[0].id, variantId: winterShirtVariants[1].id }, // M - 2 lost in transit
      { startCount: 60, endCount: 58, addedCount: 0, soldCount: 0, showId: winterShows[1].id, variantId: winterShirtVariants[2].id }, // L - 2 damaged in storage
      { startCount: 40, endCount: 39, addedCount: 0, soldCount: 0, showId: winterShows[1].id, variantId: winterShirtVariants[3].id }, // XL - 1 lost
      { startCount: 100, endCount: 96, addedCount: 0, soldCount: 0, showId: winterShows[2].id, variantId: winterScarfVariant.id }, // Scarves - 4 lost in shipment
    ];

    await Promise.all(winterInventoryData.map(record => prisma.inventoryRecord.create({ data: record })));

    // Add more comprehensive lost items across other tours
    console.log('📉 Adding additional lost items across all tours...');
    
    const additionalLostItemsData = [
      // Summer tour additional losses - using different shows/variants to avoid duplicates
      { startCount: 50, endCount: 45, addedCount: 0, soldCount: 3, showId: summerShows[3].id, variantId: summerPosterVariant.id }, // NYC Posters - 2 damaged
      { startCount: 45, endCount: 38, addedCount: 0, soldCount: 5, showId: summerShows[4].id, variantId: summerPosterVariant.id }, // LA Posters - 2 lost
      { startCount: 38, endCount: 30, addedCount: 0, soldCount: 6, showId: summerShows[5].id, variantId: summerPosterVariant.id }, // Toronto Posters - 2 damaged
      { startCount: 18, endCount: 12, addedCount: 0, soldCount: 4, showId: summerShows[2].id, variantId: summerHoodieVariants[2].id }, // Berlin L Hoodie - 2 lost
      { startCount: 15, endCount: 10, addedCount: 0, soldCount: 3, showId: summerShows[3].id, variantId: summerHoodieVariants[3].id }, // NYC XL Hoodie - 2 damaged
      
      // Spring tour additional losses - using different shows/variants
      { startCount: 25, endCount: 18, addedCount: 0, soldCount: 5, showId: springShows[3].id, variantId: springToteVariant.id }, // Vienna Totes - 2 lost
      { startCount: 18, endCount: 12, addedCount: 0, soldCount: 4, showId: springShows[4].id, variantId: springToteVariant.id }, // Budapest Totes - 2 stolen
      { startCount: 15, endCount: 11, addedCount: 0, soldCount: 3, showId: springShows[1].id, variantId: springWomensVariants[0].id }, // Amsterdam XS Womens - 1 lost
      { startCount: 12, endCount: 8, addedCount: 0, soldCount: 3, showId: springShows[4].id, variantId: springWomensVariants[3].id }, // Budapest L Womens - 1 damaged
      { startCount: 20, endCount: 15, addedCount: 0, soldCount: 4, showId: springShows[0].id, variantId: springMensVariants[0].id }, // Barcelona S Mens - 1 lost
      
      // Fall tour additional losses - using different shows/variants (avoiding duplicates)
      { startCount: 15, endCount: 10, addedCount: 0, soldCount: 3, showId: fallShows[3].id, variantId: fallMensVariants[0].id }, // Osaka S Mens - 2 lost
      { startCount: 20, endCount: 15, addedCount: 0, soldCount: 3, showId: fallShows[4].id, variantId: fallWomensVariants[0].id }, // Seoul XS Womens - 2 stolen
      { startCount: 25, endCount: 18, addedCount: 0, soldCount: 5, showId: fallShows[5].id, variantId: fallCapVariant.id }, // Bangkok Caps - 2 lost
    ];

    await Promise.all(additionalLostItemsData.map(record => prisma.inventoryRecord.create({ data: record })));

    console.log('✅ Database seeding completed successfully!');
    
    // Enhanced summary
    console.log('\n📋 Comprehensive test data summary:');
    console.log(`👤 Users: 2 (Manager & Seller with proper Auth0 IDs)`);
    console.log(`🎵 Tours: 4 tours`);
    console.log(`   • Summer 2024: ACTIVE (6 shows)`);
    console.log(`   • Spring 2024: COMPLETED (5 shows)`);
    console.log(`   • Fall 2023: COMPLETED (6 shows)`);
    console.log(`   • Winter 2024-2026: ACTIVE (5 shows)`);
    console.log(`🎪 Shows: 22 total across all tours`);
    console.log(`👕 Merch Items: 11 items with realistic images`);
    console.log(`📐 Variants: 35+ variants (includes male/female options)`);
    console.log(`📊 Inventory Records: 45+ with sales AND comprehensive shrinkage/loss data`);
    console.log(`💰 Price ranges: $15-45 across different item types`);
    
    console.log('\n🧪 Enhanced test scenarios:');
    console.log(`• Smart defaults: T-shirt progression with shrinkage losses`);
    console.log(`• Gender variants: Male/female shirts in Spring & Fall tours`);
    console.log(`• Comprehensive shrinkage: Items lost to damage/theft/transport across all tours`);
    console.log(`• Winter tour: No sales recorded, only pre-tour transport losses`);
    console.log(`• Multiple currencies: USD, EUR, GBP, AUD, JPY, etc.`);
    console.log(`• Complete tour lifecycle: Past, current, and future tours`);
    console.log(`• Realistic images: Unsplash URLs for all merchandise`);
    console.log(`• Venue variety: 22 different venues worldwide`);
    console.log(`• Stock scenarios: Sold out, low stock, and full inventory`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });