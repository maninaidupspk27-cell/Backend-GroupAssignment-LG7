const http = require('http');
const app = require('./server');

const TEST_PORT = 3001;

function runTests() {
  const server = app.listen(TEST_PORT, '127.0.0.1', async () => {
    console.log(`\n====================================================`);
    console.log(` RUNNING AUTOMATED COMPREHENSIVE TEST SUITE`);
    console.log(` Server listening on http://127.0.0.1:${TEST_PORT}`);
    console.log(`====================================================\n`);

    const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;
    let passedCount = 0;
    let failedCount = 0;

    async function test(name, fn) {
      try {
        await fn();
        console.log(`  [PASS] ${name}`);
        passedCount++;
      } catch (err) {
        console.error(`  [FAIL] ${name}: ${err.message}`);
        failedCount++;
      }
    }

    try {
      // 1. Root route
      await test('GET / returns 200 and online status', async () => {
        const res = await fetch(`${BASE_URL}/`);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const data = await res.json();
        if (data.status !== 'ONLINE') throw new Error(`Expected ONLINE status`);
      });

      // 2. Guests - Get all
      await test('GET /guests returns at least 30 records', async () => {
        const res = await fetch(`${BASE_URL}/guests`);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const guests = await res.json();
        if (!Array.isArray(guests) || guests.length < 30) {
          throw new Error(`Expected >= 30 guests, got ${guests ? guests.length : 0}`);
        }
      });

      // 3. Guests - Get by ID
      await test('GET /guests/1 returns Rahul Sharma', async () => {
        const res = await fetch(`${BASE_URL}/guests/1`);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const guest = await res.json();
        if (guest.id !== 1 || !guest.name.includes('Rahul')) {
          throw new Error(`Unexpected guest data: ${JSON.stringify(guest)}`);
        }
      });

      // 4. Guests - Create guest
      let createdGuestId;
      await test('POST /guests creates a new guest (201)', async () => {
        const res = await fetch(`${BASE_URL}/guests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test Temporary Guest',
            email: 'test.temp.guest999@example.com',
            phone: '+91-9999999999'
          })
        });
        if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
        const created = await res.json();
        if (!created.id || created.name !== 'Test Temporary Guest') {
          throw new Error(`Invalid created guest payload`);
        }
        createdGuestId = created.id;
      });

      // 5. Guests - Update guest
      await test('PUT /guests/:id updates guest (200)', async () => {
        const res = await fetch(`${BASE_URL}/guests/${createdGuestId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test Updated Guest',
            email: 'test.updated.guest999@example.com',
            phone: '+91-8888888888'
          })
        });
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const updated = await res.json();
        if (updated.name !== 'Test Updated Guest') throw new Error(`Update failed`);
      });

      // 6. Guests - Delete guest
      await test('DELETE /guests/:id deletes guest with no bookings (200)', async () => {
        const res = await fetch(`${BASE_URL}/guests/${createdGuestId}`, { method: 'DELETE' });
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      });

      // 7. Guests - Prevent delete when bookings exist
      await test('DELETE /guests/1 fails with 409 because bookings exist', async () => {
        const res = await fetch(`${BASE_URL}/guests/1`, { method: 'DELETE' });
        if (res.status !== 409) throw new Error(`Expected 409, got ${res.status}`);
      });

      // 8. Games - Get all
      await test('GET /games returns at least 30 records', async () => {
        const res = await fetch(`${BASE_URL}/games`);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const games = await res.json();
        if (!Array.isArray(games) || games.length < 30) {
          throw new Error(`Expected >= 30 games, got ${games ? games.length : 0}`);
        }
      });

      // 9. Games - Confirm Game 14
      await test('GET /games/14 returns Game 14', async () => {
        const res = await fetch(`${BASE_URL}/games/14`);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const game = await res.json();
        if (game.id !== 14 || game.name !== 'Game 14') {
          throw new Error(`Expected Game 14, got ${JSON.stringify(game)}`);
        }
      });

      // 10. Games - Search by players query parameter
      await test('GET /games?players=4 returns games suitable for 4 players', async () => {
        const res = await fetch(`${BASE_URL}/games?players=4`);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const games = await res.json();
        if (!Array.isArray(games) || games.length === 0) {
          throw new Error(`Expected matched games`);
        }
        for (const g of games) {
          if (g.min_players > 4 || g.max_players < 4) {
            throw new Error(`Game ${g.name} does not match capacity 4 (${g.min_players}-${g.max_players})`);
          }
        }
      });

      // 11. Games - Search invalid query
      await test('GET /games?players=invalid returns 400 Bad Request', async () => {
        const res = await fetch(`${BASE_URL}/games?players=invalid`);
        if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
      });

      // 12. Games - Create game
      let createdGameId;
      await test('POST /games creates new game (201)', async () => {
        const res = await fetch(`${BASE_URL}/games`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test Temporary Board Game',
            min_players: 2,
            max_players: 6,
            duration_minutes: 45
          })
        });
        if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
        const game = await res.json();
        createdGameId = game.id;
      });

      // 13. Games - Update game
      await test('PUT /games/:id updates game (200)', async () => {
        const res = await fetch(`${BASE_URL}/games/${createdGameId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test Board Game Updated',
            min_players: 3,
            max_players: 8,
            duration_minutes: 60
          })
        });
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      });

      // 14. Games - Delete game
      await test('DELETE /games/:id deletes unbooked game (200)', async () => {
        const res = await fetch(`${BASE_URL}/games/${createdGameId}`, { method: 'DELETE' });
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      });

      // 15. Bookings - Get all
      await test('GET /bookings returns at least 30 records', async () => {
        const res = await fetch(`${BASE_URL}/bookings`);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const bookings = await res.json();
        if (!Array.isArray(bookings) || bookings.length < 30) {
          throw new Error(`Expected >= 30 bookings, got ${bookings ? bookings.length : 0}`);
        }
      });

      // 16. Bookings - JOIN Details
      await test('GET /bookings/details returns joined guest_name and game_name', async () => {
        const res = await fetch(`${BASE_URL}/bookings/details`);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const details = await res.json();
        if (!Array.isArray(details) || details.length < 30) {
          throw new Error(`Expected >= 30 booking details`);
        }
        const first = details[0];
        if (!first.booking_id || !first.guest_name || !first.game_name || !first.start_date || !first.end_date) {
          throw new Error(`Missing required fields in JOIN result: ${JSON.stringify(first)}`);
        }
      });

      // ====================================================
      // THREE MANDATORY SPECIAL TWIST TESTS
      // ====================================================

      // TWIST TEST 1: End before start -> 400 Bad Request
      await test('MANDATORY TWIST TEST 1: Booking with end_date before start_date returns 400 with "End date cannot be before start date."', async () => {
        const res = await fetch(`${BASE_URL}/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guest_id: 1,
            game_id: 14,
            start_date: '2026-11-12',
            end_date: '2026-11-10'
          })
        });
        if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
        const data = await res.json();
        if (!data.error || !data.error.includes('End date cannot be before start date.')) {
          throw new Error(`Expected error message 'End date cannot be before start date.', got: ${JSON.stringify(data)}`);
        }
      });

      // TWIST TEST 2: Game 14 is NOT available on 2026-11-11
      await test('MANDATORY TWIST TEST 2: GET /games/available?date=2026-11-11 returns 200 and Game 14 is NOT present', async () => {
        const res = await fetch(`${BASE_URL}/games/available?date=2026-11-11`);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const games = await res.json();
        const game14 = games.find((g) => g.id === 14);
        if (game14) {
          throw new Error(`Game 14 should NOT be in the available games list on 2026-11-11, but was found: ${JSON.stringify(game14)}`);
        }
      });

      // TWIST TEST 3: Game 14 IS available on 2026-11-13
      await test('MANDATORY TWIST TEST 3: GET /games/available?date=2026-11-13 returns 200 and Game 14 IS present', async () => {
        const res = await fetch(`${BASE_URL}/games/available?date=2026-11-13`);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const games = await res.json();
        const game14 = games.find((g) => g.id === 14);
        if (!game14) {
          throw new Error(`Game 14 MUST be in the available games list on 2026-11-13, but was missing!`);
        }
      });

      // Additional twist validations:
      await test('GET /games/available without date parameter returns 400', async () => {
        const res = await fetch(`${BASE_URL}/games/available`);
        if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
      });

      await test('GET /games/available with invalid date format returns 400', async () => {
        const res = await fetch(`${BASE_URL}/games/available?date=not-a-date`);
        if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
      });

      await test('POST /bookings prevents overlapping bookings for same game (409 Conflict)', async () => {
        const res = await fetch(`${BASE_URL}/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guest_id: 2,
            game_id: 14,
            start_date: '2026-11-11',
            end_date: '2026-11-15'
          })
        });
        if (res.status !== 409) throw new Error(`Expected 409, got ${res.status}`);
      });

    } finally {
      server.close(() => {
        console.log(`\n====================================================`);
        console.log(` TEST RESULTS SUMMARY:`);
        console.log(` [+] Passed: ${passedCount}`);
        console.log(` [-] Failed: ${failedCount}`);
        console.log(`====================================================\n`);
        process.exit(failedCount === 0 ? 0 : 1);
      });
    }
  });
}

runTests();
