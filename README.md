# BookNook Cafe – Board Game Booking Management System

> **Backend Development Fundamentals · Group Assignment**  
> **Course Unit:** BDF Modules 1 to 3 · Card 112 of 375 · Theme 22: Board Games  
> **Group Identifier:** YG-CSEDS2B-G07  
> **Repository:** [Backend-GroupAssignment-LG7](https://github.com/maninaidupspk27-cell/Backend-GroupAssignment-LG7)  
> **Live API URL:** [https://booknook-cafe-z8sk.onrender.com](https://booknook-cafe-z8sk.onrender.com)  
>
> ### Team Members & Registration Numbers:
> 1. **SIVA SANKAR MAHAPATRO** – `252U1R3090` (Member 1: Server and Routes)
> 2. **AYYAPPA SONTI** – `252U1R3091` (Member 2: Database Architecture)
> 3. **VISHWAPATHI ARAVINDH** – `252U1R3102` (Member 3: REST Endpoints & SQL JOIN)
> 4. **RAVURI NUTHAN CHIRANJEEVI** – `252U1R3090` (Member 4: Input Validation & Search)
> 5. **SAMBANGI NIKHIL** – `252U1R3066` (Member 5: Special Twist Rule - Free On This Date)
> 6. **SINGAMSETTY MANIKANTA** – `252U1R3087` (Member 6: Postman, README & Project Lead)

---

## 1. Project Overview & Introduction

**BookNook Cafe** is a cozy board game cafe where visitors can unwind, sip beverages, and enjoy tabletop board games with friends and family. 

### Problem Statement
Guests pick board games from open shelves. Previously, cafe staff managed game reservations manually using paper ledgers or memory. Because of this:
- Game pieces frequently went missing.
- Cafe staff could not tell which games were actively in use, who was playing them, or which shelf games were reserved for upcoming hours or days.
- Double bookings occurred frequently, frustrating guests when a reserved game was already occupied.

### Objective
To build a robust, beginner-friendly, and maintainable backend REST API service using **Node.js**, **Express.js**, and **SQLite**. The system manages:
1. **Guests:** Customer records, contact information, and booking history.
2. **Games:** Game catalog including player limits (min/max) and typical play duration.
3. **Bookings:** Date-range reservations linking guests and games, strictly enforcing foreign keys and preventing date overlap.
4. **Free On This Date (Special Twist):** Identifying all board games available for reservation on a specific calendar date.

---

## 2. Technologies Used

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (v4 / v5)
- **Database:** SQLite3 (`sqlite3` driver with foreign key constraints enabled via `PRAGMA foreign_keys = ON;`)
- **API Architecture:** RESTful JSON APIs
- **API Testing:** Postman (Collection v2.1) & Automated Built-in Test Suite
- **Version Control:** Git & GitHub

---

## 3. Project Folder Structure

```
Backend-GroupAssignment-LG7/
│
├── database/
│   ├── booknook.db          # SQLite database storage (generated on seed/init)
│   ├── db.js                # Database connection, foreign key pragma & query helpers
│   ├── schema.sql           # SQL DDL table creation scripts (guests, games, bookings)
│   └── seed.js              # Automatic seeding script (32 records per table = 96 records)
│
├── controllers/
│   ├── guestController.js   # Guest CRUD handler functions
│   ├── gameController.js    # Game CRUD, player search & available games twist handlers
│   └── bookingController.js # Booking creation, listing & SQL JOIN details handlers
│
├── middleware/
│   └── validation.js        # Input validation, email checks, date ordering & overlap checks
│
├── routes/
│   ├── guestRoutes.js       # Endpoints for /guests
│   ├── gameRoutes.js        # Endpoints for /games & /games/available
│   └── bookingRoutes.js     # Endpoints for /bookings & /bookings/details
│
├── postman/
│   └── BookNook.postman_collection.json # Complete 18-request Postman test suite
│
├── server.js                # Express app entry point, middleware & route mounting
├── test.js                  # Automated test script verifying all 22 test cases
├── package.json             # Project dependencies and npm scripts
├── .gitignore               # Files excluded from git tracking
└── README.md                # Comprehensive documentation & beginner study guide
```

---

## 4. Database Schema & Relationships

The database consists of **three related tables** with strict foreign key constraints.

```
 +--------------------+       +----------------------+       +--------------------+
 |       GUESTS       |       |       BOOKINGS       |       |       GAMES        |
 +--------------------+       +----------------------+       +--------------------+
 | id (PK, AutoInc)   |<-----\| id (PK, AutoInc)     |/----->| id (PK, AutoInc)   |
 | name (TEXT)        |       | guest_id (FK -> id)  |       | name (TEXT)        |
 | email (TEXT, UNIQ) |       | game_id (FK -> id)   |       | min_players (INT)  |
 | phone (TEXT)       |       | start_date (TEXT)    |       | max_players (INT)  |
 +--------------------+       | end_date (TEXT)      |       | duration_min (INT) |
                              +----------------------+       +--------------------+
```

### Table 1: `guests`
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique guest identifier |
| `name` | TEXT | NOT NULL | Full name of the guest |
| `email` | TEXT | UNIQUE, NOT NULL | Unique guest email address |
| `phone` | TEXT | NULLABLE | Guest contact phone number |

### Table 2: `games`
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique board game identifier |
| `name` | TEXT | NOT NULL | Title of the board game |
| `min_players` | INTEGER | NOT NULL (> 0) | Minimum players required |
| `max_players` | INTEGER | NOT NULL (>= min_players) | Maximum players supported |
| `duration_minutes` | INTEGER | NOT NULL (> 0) | Approximate duration in minutes |

### Table 3: `bookings`
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique reservation identifier |
| `guest_id` | INTEGER | NOT NULL, FK -> `guests(id)` | Guest who made the booking |
| `game_id` | INTEGER | NOT NULL, FK -> `games(id)` | Board game being reserved |
| `start_date` | TEXT | NOT NULL (YYYY-MM-DD) | Booking start date (inclusive) |
| `end_date` | TEXT | NOT NULL (YYYY-MM-DD) | Booking end date (inclusive) |

### Relationships & Foreign Keys
- **One Guest to Many Bookings:** A guest can make multiple reservations across different dates.
- **One Game to Many Bookings:** A board game can have multiple reservations on non-overlapping dates.
- **Foreign Key Constraints:** `PRAGMA foreign_keys = ON;` is enforced on every database connection. Deleting a guest or game with active bookings is strictly prohibited (`409 Conflict`).

---

## 5. Sample Data & Automatic Seeding

The project includes an automatic, idempotent seeding script (`database/seed.js`):
- **Guests:** 32 realistic customer records with unique emails.
- **Games:** 32 board games, including popular classics (*Chess, Ludo, Monopoly, Scrabble, Uno, Carrom, Catan, Jenga*) and the **mandatory `Game 14` with ID `14`**.
- **Bookings:** 32 valid booking records with non-overlapping dates.
- **Mandatory Seed Booking for Game 14:**
  - Guest ID: `1`
  - Game ID: `14`
  - Start Date: `2026-11-10`
  - End Date: `2026-11-12`
  - **No other booking for Game 14 covers November 13, 2026.**

Total Seed Records: **96 records** (exceeds the 90 minimum requirement).

---

## 6. Complete REST API Endpoints

### Guest APIs (`/guests`)
| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/guests` | List all guests (30+ records) | `200 OK` |
| `GET` | `/guests/:id` | Fetch one guest by ID | `200 OK`, `400`, `404` |
| `POST` | `/guests` | Add a new guest (validates name & unique email) | `201 Created`, `400`, `409` |
| `PUT` | `/guests/:id` | Update guest details | `200 OK`, `400`, `404`, `409` |
| `DELETE`| `/guests/:id` | Delete guest (blocks if bookings exist) | `200 OK`, `404`, `409` |

### Game APIs (`/games`)
| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/games` | List all games (30+ records) | `200 OK` |
| `GET` | `/games?players=4` | Search games suitable for 4 players | `200 OK`, `400` |
| `GET` | `/games/available?date=YYYY-MM-DD` | **Special Twist:** Available games on date | `200 OK`, `400` |
| `GET` | `/games/:id` | Fetch one game by ID | `200 OK`, `400`, `404` |
| `POST` | `/games` | Add a new board game | `201 Created`, `400` |
| `PUT` | `/games/:id` | Update an existing game | `200 OK`, `400`, `404` |
| `DELETE`| `/games/:id` | Delete a game (blocks if bookings exist) | `200 OK`, `404`, `409` |

> **Critical Express Route Ordering:** `/games/available` is registered **before** `/games/:id` in `routes/gameRoutes.js` so Express does not treat `"available"` as an `:id` parameter.

### Booking APIs (`/bookings`)
| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/bookings` | List all bookings (30+ records) | `200 OK` |
| `GET` | `/bookings/details` | **SQL JOIN:** Bookings with guest & game names | `200 OK` |
| `GET` | `/bookings/:id` | Fetch one booking by ID | `200 OK`, `400`, `404` |
| `POST` | `/bookings` | Create new booking (checks overlap & dates) | `201 Created`, `400`, `404`, `409` |
| `DELETE`| `/bookings/:id` | Delete booking by ID | `200 OK`, `400`, `404` |

---

## 7. SQL JOIN Endpoint (`GET /bookings/details`)

The cafe staff needs to see human-readable booking information rather than raw database foreign key IDs.

### SQL Implementation
```sql
SELECT
  b.id AS booking_id,
  gu.name AS guest_name,
  ga.name AS game_name,
  b.start_date,
  b.end_date
FROM bookings b
INNER JOIN guests gu ON b.guest_id = gu.id
INNER JOIN games ga ON b.game_id = ga.id
ORDER BY b.id ASC;
```

### Sample Response (`200 OK`)
```json
[
  {
    "booking_id": 1,
    "guest_name": "Rahul Sharma",
    "game_name": "Game 14",
    "start_date": "2026-11-10",
    "end_date": "2026-11-12"
  },
  {
    "booking_id": 2,
    "guest_name": "Priya Patel",
    "game_name": "Chess",
    "start_date": "2026-11-01",
    "end_date": "2026-11-03"
  }
]
```

---

## 8. Search Functionality (`GET /games?players=4`)

Guests frequently visit in specific party sizes (e.g. 4 friends). This endpoint searches games where the party size fits between `min_players` and `max_players`:

```sql
SELECT *
FROM games
WHERE min_players <= ? AND max_players >= ?
ORDER BY id ASC;
```

- If `players` is invalid (e.g., `?players=abc` or `?players=-2`): returns `400 Bad Request`.
- If no games fit: returns `[]` (empty JSON array) with `200 OK`.

---

## 9. Special Twist: Free On This Date

### Business Logic
1. Every booking has inclusive `start_date` and `end_date` (format: `YYYY-MM-DD`).
2. A game is **booked** on a requested date if:
   `start_date <= requested_date AND end_date >= requested_date`
3. A game is **available** if its `id` is NOT in that booked set.
4. If `date` is missing or in an invalid format, return `400 Bad Request`.

### SQL Implementation
```sql
SELECT *
FROM games
WHERE id NOT IN (
    SELECT game_id
    FROM bookings
    WHERE start_date <= ?
      AND end_date >= ?
)
ORDER BY id ASC;
```
The requested date is passed as both parameters.

---

## 10. The Three Mandatory Special Twist Tests

These 3 test scenarios are **compulsory** as defined in the client assignment card:

### Test 1: Invalid Date Range
- **Action:** `POST /bookings` with:
  ```json
  {
    "guest_id": 1,
    "game_id": 14,
    "start_date": "2026-11-12",
    "end_date": "2026-11-10"
  }
  ```
- **Expected Status:** `400 Bad Request`
- **Expected Message:** `"End date cannot be before start date."`
- **Result:** **PASSED**

### Test 2: Game 14 is Booked (Unavailable) on November 11
- **Action:** `GET /games/available?date=2026-11-11`
- **Expected Status:** `200 OK`
- **Expected Behavior:** `Game 14` must **NOT** be in the returned list because it has an active booking from Nov 10 to Nov 12.
- **Result:** **PASSED**

### Test 3: Game 14 is Free (Available) on November 13
- **Action:** `GET /games/available?date=2026-11-13`
- **Expected Status:** `200 OK`
- **Expected Behavior:** `Game 14` **MUST** be present in the returned list because its previous booking ended on Nov 12.
- **Result:** **PASSED**

---

## 11. Quick Start & Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/maninaidupspk27-cell/Backend-GroupAssignment-LG7.git
cd Backend-GroupAssignment-LG7
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Seed the Database
```bash
npm run seed
```
*Output confirms 32 guests, 32 games, and 32 bookings seeded safely.*

### Step 4: Run Automated Tests
```bash
npm test
```
*Executes all 22 automated integration tests, including the 3 mandatory twist tests.*

### Step 5: Start the Server
```bash
npm start
```
*The API is now running at `http://localhost:3000`.*

---

## 12. Testing with Postman

A ready-to-import Postman Collection is provided in the `postman/` directory:
- **File:** `postman/BookNook.postman_collection.json`
- **Collection Name:** `BookNook Cafe API Testing`

### How to Import and Run:
1. Open Postman.
2. Click **Import** (top left).
3. Drag and drop `postman/BookNook.postman_collection.json`.
4. Ensure the collection variable `baseUrl` is set to `http://localhost:3000`.
5. Run the entire collection using the **Postman Collection Runner** or execute requests 1 through 18 sequentially.
6. Check the **Test Results** tab in Postman—all tests will display `PASS`.

---

## 13. Division of Work – Six Team Members & Instructor Presentation Paths

Our team (Group 7: YG-CSEDS2B-G07) divided the project across 6 defined responsibilities. Each team member has specific files and code paths to demonstrate to the instructor during the live evaluation:

| Member & Reg No. | Assigned Role | Presentation File Paths | What to Present to the Instructor | Git Commit |
| :--- | :--- | :--- | :--- | :--- |
| **SIVA SANKAR MAHAPATRO**<br>`252U1R3090` | **Member 1: Server and Routes** | • `server.js`<br>• `routes/guestRoutes.js`<br>• `routes/gameRoutes.js`<br>• `routes/bookingRoutes.js` | Express app configuration, `express.json()` middleware, route mounting (`/guests`, `/games`, `/bookings`), 404 & 500 error handlers, and route ordering (`/games/available` before `/:id`). | `feat(server): setup express server, middleware, and route mounting` |
| **AYYAPPA SONTI**<br>`252U1R3091` | **Member 2: Database Architecture** | • `database/schema.sql`<br>• `database/db.js`<br>• `database/seed.js` | 3 related SQLite tables, foreign key constraints (`PRAGMA foreign_keys = ON;`), ON DELETE RESTRICT rules, 96-record automatic seeding script, and mandatory Game 14 verification. | `feat(database): implement sqlite schema, foreign keys, and seed script` |
| **VISHWAPATHI ARAVINDH**<br>`252U1R3102` | **Member 3: REST Endpoints & SQL JOIN** | • `controllers/guestController.js`<br>• `controllers/gameController.js`<br>• `controllers/bookingController.js` | Guest & Game CRUD operations (`GET`, `POST`, `PUT`, `DELETE`), safe deletion checks (blocking deletion if bookings exist), and `GET /bookings/details` multi-table SQL `INNER JOIN`. | `feat(controllers): implement guest, game, and booking CRUD & join endpoints` |
| **RAVURI NUTHAN CHIRANJEEVI**<br>`252U1R3090` | **Member 4: Input Validation & Search** | • `middleware/validation.js`<br>• `controllers/gameController.js` | Required fields and regex email checks, positive player integer limits (`min_players <= max_players`), and player capacity search endpoint (`GET /games?players=4`). | `feat(middleware): add input validation and player capacity search` |
| **SAMBANGI NIKHIL**<br>`252U1R3066` | **Member 5: Special Twist Rule (Free on this date)** | • `controllers/gameController.js` (`getAvailableGames`)<br>• `middleware/validation.js` (`validateBooking`)<br>• `test.js` (Twist tests 1, 2, 3) | "Free on this date" SQL logic (`WHERE id NOT IN (SELECT game_id FROM bookings...)`), date overlap check, and live demonstration of the 3 mandatory twist tests. | `feat(twist): implement free on this date rule and mandatory test suite` |
| **SINGAMSETTY MANIKANTA**<br>`252U1R3087` (Lead) | **Member 6: Postman Suite, README & Lead** | • `postman/BookNook.postman_collection.json`<br>• `README.md`<br>• `package.json`<br>• `test.js` | Complete 18-request Postman test collection with JavaScript assertions, automated testing runner (`npm test`), comprehensive documentation, and team coordination. | `docs: add comprehensive postman test suite, readme, and beginner guide` |

---

### Instructor Presentation Guide by Member

#### 1. SIVA SANKAR MAHAPATRO (252U1R3090) – Server and Routes
- **Files to open:** `server.js` and `routes/gameRoutes.js`
- **Lines to highlight in `server.js`:**
  - Lines 14: `app.use(express.json());` (Parsing JSON bodies)
  - Lines 41-43: Route mounting for `/guests`, `/games`, and `/bookings`
  - Lines 46-59: 404 Route Not Found and 500 Global Error Handler
- **Lines to highlight in `routes/gameRoutes.js`:**
  - Lines 14-18: Why `router.get('/available', ...)` is placed **above** `router.get('/:id', ...)` so Express does not treat `"available"` as an ID.
- **Viva Answer:** *"Express evaluates route paths sequentially from top to bottom. If `/games/:id` were declared first, Express would capture the string 'available' as `:id`, routing the request to `getGameById` instead of `getAvailableGames`."*

#### 2. AYYAPPA SONTI (252U1R3091) – Database Architecture
- **Files to open:** `database/schema.sql` and `database/seed.js`
- **Lines to highlight in `database/schema.sql`:**
  - Line 2: `PRAGMA foreign_keys = ON;`
  - Lines 37-38: Foreign keys `guest_id REFERENCES guests(id)` and `game_id REFERENCES games(id) ON DELETE RESTRICT`
- **Lines to highlight in `database/seed.js`:**
  - Lines 125-151: Use of `INSERT OR IGNORE` to ensure idempotent seeding without duplicating rows
  - Lines 160-164: Seeding verification report printing 32 guests, 32 games, and 32 bookings (96 total records)
  - Lines 166-179: Verification of mandatory Game 14 and its seed booking (Nov 10 to Nov 12)
- **Live Terminal Command to Run:** `npm run seed`
- **Viva Answer:** *"SQLite disables foreign key constraints by default for backward compatibility with older applications. We enforce `PRAGMA foreign_keys = ON;` on initialization to ensure database-level referential integrity."*

#### 3. VISHWAPATHI ARAVINDH (252U1R3102) – REST Endpoints & SQL JOIN
- **Files to open:** `controllers/bookingController.js` and `controllers/guestController.js`
- **Lines to highlight in `controllers/bookingController.js`:**
  - Lines 44-55: The `GET /bookings/details` multi-table `INNER JOIN` query:
    ```sql
    SELECT b.id AS booking_id, gu.name AS guest_name, ga.name AS game_name, b.start_date, b.end_date
    FROM bookings b
    INNER JOIN guests gu ON b.guest_id = gu.id
    INNER JOIN games ga ON b.game_id = ga.id
    ORDER BY b.id ASC;
    ```
- **Lines to highlight in `controllers/guestController.js`:**
  - Lines 110-119: Safe deletion check preventing deletion of any guest who has active bookings (`409 Conflict`).
- **Live Endpoint to Test:** `GET http://localhost:3000/bookings/details`
- **Viva Answer:** *"An `INNER JOIN` matches foreign keys between `bookings`, `guests`, and `games`. This lets us return human-readable guest and game names to cafe staff instead of arbitrary numeric IDs."*

#### 4. RAVURI NUTHAN CHIRANJEEVI (252U1R3090) – Input Validation & Search
- **Files to open:** `middleware/validation.js` and `controllers/gameController.js`
- **Lines to highlight in `middleware/validation.js`:**
  - Lines 22-38: Name and email presence, regex validation (`EMAIL_REGEX`), and email uniqueness check (`409 Conflict`)
  - Lines 88-115: Game validation checking `min_players > 0`, `max_players >= min_players`, and `duration > 0`
- **Lines to highlight in `controllers/gameController.js`:**
  - Lines 20-28: Search query logic for `GET /games?players=4`:
    ```sql
    WHERE min_players <= ? AND max_players >= ?
    ```
- **Live Endpoint to Test:** `GET http://localhost:3000/games?players=4`
- **Viva Answer:** *"Our search endpoint checks if a party of guests falls within the supported range of the game: `min_players <= players AND max_players >= players`. If an invalid string like `?players=abc` is passed, we return `400 Bad Request`."*

#### 5. SAMBANGI NIKHIL (252U1R3066) – Special Twist Rule (Free on this date)
- **Files to open:** `controllers/gameController.js` and `middleware/validation.js`
- **Lines to highlight in `controllers/gameController.js`:**
  - Lines 51-61: The SQL exclusion subquery:
    ```sql
    SELECT * FROM games
    WHERE id NOT IN (
      SELECT game_id FROM bookings
      WHERE start_date <= ? AND end_date >= ?
    ) ORDER BY id ASC;
    ```
- **Lines to highlight in `middleware/validation.js`:**
  - Lines 184-186: Date ordering check returning exact string: `"End date cannot be before start date."`
- **Live Demonstration of the 3 Mandatory Tests:**
  1. `POST /bookings` with `start_date: 2026-11-12`, `end_date: 2026-11-10` $\to$ Returns `400 Bad Request`
  2. `GET /games/available?date=2026-11-11` $\to$ Returns `200 OK`, **Game 14 is NOT in the list**
  3. `GET /games/available?date=2026-11-13` $\to$ Returns `200 OK`, **Game 14 IS in the list**
- **Viva Answer:** *"Both start and end dates are inclusive. On Nov 11, Game 14 is active (`2026-11-10 <= 2026-11-11 <= 2026-11-12`), so the subquery catches it and `NOT IN` excludes it. On Nov 13, the booking has ended, so Game 14 is returned as free."*

#### 6. SINGAMSETTY MANIKANTA (252U1R3087) – Postman Suite, README & Project Lead
- **Files to open:** `postman/BookNook.postman_collection.json`, `test.js`, and `README.md`
- **Things to show the Instructor:**
  - Run the automated test suite in terminal: `npm test` (all 22 tests pass)
  - Open Postman, show the **"BookNook Cafe API Testing"** collection with 18 requests organized in folders (Guests, Games, Bookings, Special Twist)
  - Run the Postman Collection Runner to show 18 green `PASS` checkmarks
  - Show the Git commit history with 6 individual member commits pushed to GitHub
- **Viva Answer:** *"We created automated test scripts inside Postman using `pm.test` to verify HTTP status codes (200, 201, 400, 404, 409) and data payload integrity, ensuring continuous verification across our entire REST API."*

---

## 14. Beginner's Educational Guide

### 1. What is an Express Route?
In Express, a route links an HTTP method (`GET`, `POST`, `PUT`, `DELETE`) and a URL path (e.g., `/guests`) to a specific JavaScript function called a **controller**. When a client makes a request to that URL, Express routes the request to that function.

### 2. Primary Keys vs. Foreign Keys
- **Primary Key (`id`):** A unique identifier for each row in a table. In SQLite, `INTEGER PRIMARY KEY AUTOINCREMENT` ensures every row gets a unique number automatically.
- **Foreign Key (`guest_id`, `game_id`):** A reference in one table that links directly to the Primary Key of another table. This maintains referential integrity (e.g., you cannot make a booking for a guest that doesn't exist).

### 3. What is an SQL JOIN?
In relational databases, information is normalized across separate tables. An `INNER JOIN` matches rows from two or more tables based on a common field. For example:
```sql
FROM bookings b
INNER JOIN guests gu ON b.guest_id = gu.id
```
This joins each booking row with its corresponding guest row so we can display the guest's name alongside the booking dates!

### 4. How the "Free On This Date" Logic Works
Imagine a board game is a physical box. If a guest reserved it from November 10 to November 12:
- On **November 11**, the date is between start and end (`2026-11-10 <= 2026-11-11 <= 2026-11-12`). The subquery catches it as "currently in use", and `NOT IN` filters it out.
- On **November 13**, the previous booking has expired. The subquery returns nothing for Game 14, so `NOT IN` keeps Game 14 in the available shelf!

---

## 15. Live Demonstration Guide (For Demo Day)

During the 3-minute group presentation:
1. **Startup (30s):** Run `npm start` in the terminal to show the clean server banner.
2. **Game Catalog & Search (45s):** Open Postman and run `GET /games?players=4` to show dynamic filtering.
3. **SQL JOIN (45s):** Run `GET /bookings/details` to show joined guest and game names.
4. **The Special Twist (60s):**
   - Run `POST /bookings` with invalid date order (`2026-11-12` to `2026-11-10`) -> Show `400 Bad Request`.
   - Run `GET /games/available?date=2026-11-11` -> Show `Game 14` is **missing**.
   - Run `GET /games/available?date=2026-11-13` -> Show `Game 14` is **present**.
5. **Team Q&A:** Each member answers one question about their specific role.
