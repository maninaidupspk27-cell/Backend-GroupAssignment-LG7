const { db, query, initDb } = require('./db');

// Sample Guests Data (32 records)
const sampleGuests = [
  { id: 1, name: "Rahul Sharma", email: "rahul.sharma@example.com", phone: "+91-9876543201" },
  { id: 2, name: "Priya Patel", email: "priya.patel@example.com", phone: "+91-9876543202" },
  { id: 3, name: "Amit Verma", email: "amit.verma@example.com", phone: "+91-9876543203" },
  { id: 4, name: "Sneha Reddy", email: "sneha.reddy@example.com", phone: "+91-9876543204" },
  { id: 5, name: "Rohan Gupta", email: "rohan.gupta@example.com", phone: "+91-9876543205" },
  { id: 6, name: "Ananya Iyer", email: "ananya.iyer@example.com", phone: "+91-9876543206" },
  { id: 7, name: "Vikram Malhotra", email: "vikram.m@example.com", phone: "+91-9876543207" },
  { id: 8, name: "Pooja Nair", email: "pooja.nair@example.com", phone: "+91-9876543208" },
  { id: 9, name: "Karan Singh", email: "karan.singh@example.com", phone: "+91-9876543209" },
  { id: 10, name: "Divya Joshi", email: "divya.joshi@example.com", phone: "+91-9876543210" },
  { id: 11, name: "Arjun Mehta", email: "arjun.mehta@example.com", phone: "+91-9876543211" },
  { id: 12, name: "Kavita Rao", email: "kavita.rao@example.com", phone: "+91-9876543212" },
  { id: 13, name: "Sanjay Kumar", email: "sanjay.kumar@example.com", phone: "+91-9876543213" },
  { id: 14, name: "Neha Kapoor", email: "neha.kapoor@example.com", phone: "+91-9876543214" },
  { id: 15, name: "Manish Jain", email: "manish.jain@example.com", phone: "+91-9876543215" },
  { id: 16, name: "Ritu Saxena", email: "ritu.saxena@example.com", phone: "+91-9876543216" },
  { id: 17, name: "Suresh Menon", email: "suresh.menon@example.com", phone: "+91-9876543217" },
  { id: 18, name: "Swati Deshmukh", email: "swati.d@example.com", phone: "+91-9876543218" },
  { id: 19, name: "Rajesh Khanna", email: "rajesh.k@example.com", phone: "+91-9876543219" },
  { id: 20, name: "Deepa Nambiar", email: "deepa.n@example.com", phone: "+91-9876543220" },
  { id: 21, name: "Aditya Choudhury", email: "aditya.c@example.com", phone: "+91-9876543221" },
  { id: 22, name: "Meera Pillai", email: "meera.p@example.com", phone: "+91-9876543222" },
  { id: 23, name: "Harish Bhat", email: "harish.bhat@example.com", phone: "+91-9876543223" },
  { id: 24, name: "Shreya Das", email: "shreya.das@example.com", phone: "+91-9876543224" },
  { id: 25, name: "Nikhil Roy", email: "nikhil.roy@example.com", phone: "+91-9876543225" },
  { id: 26, name: "Tanvi Bhatt", email: "tanvi.bhatt@example.com", phone: "+91-9876543226" },
  { id: 27, name: "Gaurav Sethi", email: "gaurav.sethi@example.com", phone: "+91-9876543227" },
  { id: 28, name: "Aishwarya Sen", email: "aishwarya.s@example.com", phone: "+91-9876543228" },
  { id: 29, name: "Varun Aggarwal", email: "varun.a@example.com", phone: "+91-9876543229" },
  { id: 30, name: "Rakesh Pandey", email: "rakesh.p@example.com", phone: "+91-9876543230" },
  { id: 31, name: "Sunita Goswami", email: "sunita.g@example.com", phone: "+91-9876543231" },
  { id: 32, name: "Kunal Mukherjee", email: "kunal.m@example.com", phone: "+91-9876543232" }
];

// Sample Games Data (32 records, including mandatory Game 14)
const sampleGames = [
  { id: 1, name: "Chess", min_players: 2, max_players: 2, duration_minutes: 60 },
  { id: 2, name: "Ludo", min_players: 2, max_players: 4, duration_minutes: 45 },
  { id: 3, name: "Monopoly", min_players: 2, max_players: 8, duration_minutes: 120 },
  { id: 4, name: "Scrabble", min_players: 2, max_players: 4, duration_minutes: 60 },
  { id: 5, name: "Uno", min_players: 2, max_players: 10, duration_minutes: 30 },
  { id: 6, name: "Carrom", min_players: 2, max_players: 4, duration_minutes: 45 },
  { id: 7, name: "Checkers", min_players: 2, max_players: 2, duration_minutes: 30 },
  { id: 8, name: "Catan", min_players: 3, max_players: 4, duration_minutes: 90 },
  { id: 9, name: "Jenga", min_players: 2, max_players: 6, duration_minutes: 20 },
  { id: 10, name: "Battleship", min_players: 2, max_players: 2, duration_minutes: 30 },
  { id: 11, name: "Risk", min_players: 2, max_players: 6, duration_minutes: 120 },
  { id: 12, name: "Clue", min_players: 3, max_players: 6, duration_minutes: 60 },
  { id: 13, name: "Ticket to Ride", min_players: 2, max_players: 5, duration_minutes: 60 },
  { id: 14, name: "Game 14", min_players: 2, max_players: 4, duration_minutes: 60 }, // Mandatory ID 14
  { id: 15, name: "Pandemic", min_players: 2, max_players: 4, duration_minutes: 45 },
  { id: 16, name: "Splendor", min_players: 2, max_players: 4, duration_minutes: 30 },
  { id: 17, name: "Carcassonne", min_players: 2, max_players: 5, duration_minutes: 45 },
  { id: 18, name: "7 Wonders", min_players: 3, max_players: 7, duration_minutes: 30 },
  { id: 19, name: "Wingspan", min_players: 1, max_players: 5, duration_minutes: 70 },
  { id: 20, name: "Azul", min_players: 2, max_players: 4, duration_minutes: 45 },
  { id: 21, name: "Dixit", min_players: 3, max_players: 8, duration_minutes: 30 },
  { id: 22, name: "Codenames", min_players: 4, max_players: 8, duration_minutes: 15 },
  { id: 23, name: "Coup", min_players: 2, max_players: 6, duration_minutes: 15 },
  { id: 24, name: "The Resistance", min_players: 5, max_players: 10, duration_minutes: 30 },
  { id: 25, name: "Exploding Kittens", min_players: 2, max_players: 5, duration_minutes: 15 },
  { id: 26, name: "Secret Hitler", min_players: 5, max_players: 10, duration_minutes: 45 },
  { id: 27, name: "Dominion", min_players: 2, max_players: 4, duration_minutes: 30 },
  { id: 28, name: "Terraforming Mars", min_players: 1, max_players: 5, duration_minutes: 120 },
  { id: 29, name: "Everdell", min_players: 1, max_players: 4, duration_minutes: 80 },
  { id: 30, name: "Scythe", min_players: 1, max_players: 5, duration_minutes: 115 },
  { id: 31, name: "Brass: Birmingham", min_players: 2, max_players: 4, duration_minutes: 120 },
  { id: 32, name: "Gloomhaven: Jaws of the Lion", min_players: 1, max_players: 4, duration_minutes: 90 }
];

// Sample Bookings Data (32 records)
// Booking 1 is the mandatory booking for Game 14: Guest 1, Game 14, 2026-11-10 to 2026-11-12
// Note: No other booking exists for Game 14 covering Nov 13, 2026.
const sampleBookings = [
  { id: 1, guest_id: 1, game_id: 14, start_date: "2026-11-10", end_date: "2026-11-12" }, // Required test booking
  { id: 2, guest_id: 2, game_id: 1, start_date: "2026-11-01", end_date: "2026-11-03" },
  { id: 3, guest_id: 3, game_id: 2, start_date: "2026-11-02", end_date: "2026-11-04" },
  { id: 4, guest_id: 4, game_id: 3, start_date: "2026-11-05", end_date: "2026-11-07" },
  { id: 5, guest_id: 5, game_id: 4, start_date: "2026-11-03", end_date: "2026-11-05" },
  { id: 6, guest_id: 6, game_id: 5, start_date: "2026-11-08", end_date: "2026-11-09" },
  { id: 7, guest_id: 7, game_id: 6, start_date: "2026-11-10", end_date: "2026-11-12" },
  { id: 8, guest_id: 8, game_id: 7, start_date: "2026-11-04", end_date: "2026-11-06" },
  { id: 9, guest_id: 9, game_id: 8, start_date: "2026-11-11", end_date: "2026-11-14" },
  { id: 10, guest_id: 10, game_id: 9, start_date: "2026-11-06", end_date: "2026-11-08" },
  { id: 11, guest_id: 11, game_id: 10, start_date: "2026-11-15", end_date: "2026-11-17" },
  { id: 12, guest_id: 12, game_id: 11, start_date: "2026-11-07", end_date: "2026-11-09" },
  { id: 13, guest_id: 13, game_id: 12, start_date: "2026-11-12", end_date: "2026-11-14" },
  { id: 14, guest_id: 14, game_id: 13, start_date: "2026-11-16", end_date: "2026-11-18" },
  { id: 15, guest_id: 15, game_id: 15, start_date: "2026-11-05", end_date: "2026-11-07" },
  { id: 16, guest_id: 16, game_id: 16, start_date: "2026-11-09", end_date: "2026-11-11" },
  { id: 17, guest_id: 17, game_id: 17, start_date: "2026-11-13", end_date: "2026-11-15" },
  { id: 18, guest_id: 18, game_id: 18, start_date: "2026-11-02", end_date: "2026-11-04" },
  { id: 19, guest_id: 19, game_id: 19, start_date: "2026-11-14", end_date: "2026-11-16" },
  { id: 20, guest_id: 20, game_id: 20, start_date: "2026-11-18", end_date: "2026-11-20" },
  { id: 21, guest_id: 21, game_id: 21, start_date: "2026-11-03", end_date: "2026-11-05" },
  { id: 22, guest_id: 22, game_id: 22, start_date: "2026-11-07", end_date: "2026-11-08" },
  { id: 23, guest_id: 23, game_id: 23, start_date: "2026-11-21", end_date: "2026-11-23" },
  { id: 24, guest_id: 24, game_id: 24, start_date: "2026-11-10", end_date: "2026-11-12" },
  { id: 25, guest_id: 25, game_id: 25, start_date: "2026-11-15", end_date: "2026-11-17" },
  { id: 26, guest_id: 26, game_id: 26, start_date: "2026-11-19", end_date: "2026-11-21" },
  { id: 27, guest_id: 27, game_id: 27, start_date: "2026-11-04", end_date: "2026-11-06" },
  { id: 28, guest_id: 28, game_id: 28, start_date: "2026-11-22", end_date: "2026-11-25" },
  { id: 29, guest_id: 29, game_id: 29, start_date: "2026-11-08", end_date: "2026-11-10" },
  { id: 30, guest_id: 30, game_id: 30, start_date: "2026-11-12", end_date: "2026-11-14" },
  { id: 31, guest_id: 31, game_id: 31, start_date: "2026-11-16", end_date: "2026-11-18" },
  { id: 32, guest_id: 32, game_id: 32, start_date: "2026-11-20", end_date: "2026-11-22" }
];

async function seedDatabase() {
  console.log('====================================================');
  console.log(' BookNook Cafe - Database Seeding Script');
  console.log('====================================================');

  try {
    // 1. Ensure schema is initialized
    await initDb();
    console.log('[*] Database schema verified successfully.');

    // 2. Insert Guests (INSERT OR IGNORE to prevent duplicates)
    console.log('[*] Seeding guests table...');
    const insertGuestSql = `
      INSERT OR IGNORE INTO guests (id, name, email, phone)
      VALUES (?, ?, ?, ?)
    `;
    for (const g of sampleGuests) {
      await query.run(insertGuestSql, [g.id, g.name, g.email, g.phone]);
    }

    // 3. Insert Games (INSERT OR IGNORE)
    console.log('[*] Seeding games table...');
    const insertGameSql = `
      INSERT OR IGNORE INTO games (id, name, min_players, max_players, duration_minutes)
      VALUES (?, ?, ?, ?, ?)
    `;
    for (const gm of sampleGames) {
      await query.run(insertGameSql, [gm.id, gm.name, gm.min_players, gm.max_players, gm.duration_minutes]);
    }

    // 4. Insert Bookings (INSERT OR IGNORE)
    console.log('[*] Seeding bookings table...');
    const insertBookingSql = `
      INSERT OR IGNORE INTO bookings (id, guest_id, game_id, start_date, end_date)
      VALUES (?, ?, ?, ?, ?)
    `;
    for (const b of sampleBookings) {
      await query.run(insertBookingSql, [b.id, b.guest_id, b.game_id, b.start_date, b.end_date]);
    }

    // 5. Verification: Count records in each table
    const guestsCount = (await query.get('SELECT COUNT(*) AS count FROM guests')).count;
    const gamesCount = (await query.get('SELECT COUNT(*) AS count FROM games')).count;
    const bookingsCount = (await query.get('SELECT COUNT(*) AS count FROM bookings')).count;

    console.log('====================================================');
    console.log(' SEEDING VERIFICATION REPORT:');
    console.log(` [+] Guests Table:   ${guestsCount} records (Minimum required: 30)`);
    console.log(` [+] Games Table:    ${gamesCount} records (Minimum required: 30)`);
    console.log(` [+] Bookings Table: ${bookingsCount} records (Minimum required: 30)`);
    console.log(` [+] Total Records:  ${guestsCount + gamesCount + bookingsCount} records`);

    // Verify Game 14
    const game14 = await query.get('SELECT * FROM games WHERE id = 14');
    if (game14) {
      console.log(` [+] Mandatory Game 14 found: "${game14.name}" (min: ${game14.min_players}, max: ${game14.max_players})`);
    } else {
      console.warn(' [!] WARNING: Game 14 was NOT found!');
    }

    // Verify Game 14 booking
    const game14Booking = await query.get('SELECT * FROM bookings WHERE game_id = 14');
    if (game14Booking) {
      console.log(` [+] Game 14 Booking found: Guest ID ${game14Booking.guest_id}, Dates: ${game14Booking.start_date} to ${game14Booking.end_date}`);
    } else {
      console.warn(' [!] WARNING: Booking for Game 14 was NOT found!');
    }

    console.log('====================================================');
    console.log('[+] Database seeding completed successfully!');
    console.log('====================================================');
    return { guestsCount, gamesCount, bookingsCount };
  } catch (err) {
    console.error('[-] Seeding failed with error:', err);
    process.exit(1);
  }
}

// Allow independent execution
if (require.main === module) {
  seedDatabase().then(() => {
    db.close();
  });
}

module.exports = { seedDatabase };
