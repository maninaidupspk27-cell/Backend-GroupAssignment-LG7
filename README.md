# BookNook Cafe – Board Game Booking Management System

> **Backend Development Fundamentals · Group Assignment**  
> **Course Unit:** BDF Modules 1 to 3 · Card 112 of 375 · Theme 22: Board Games  
> **Group Identifier:** YG-CSEDS2B-G07  
> **Repository:** [Backend-GroupAssignment-LG7](https://github.com/maninaidupspk27-cell/Backend-GroupAssignment-LG7)

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

## 13. Division of Work – Six Team Members

Our team (Group 7: YG-CSEDS2B-G07) divided the project across 6 defined responsibilities:

| Member | Role | Core Deliverables & Contributions | Suggested Git Commit |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Server and Routes** | Node & Express configuration, `server.js`, 404/500 middleware, route mounting, port binding | `feat(server): setup express server, middleware, and route mounting` |
| **Member 2** | **Database Architecture** | SQLite database schema (`schema.sql`), connection & pragma helper (`db.js`), 96-record seeder (`seed.js`) | `feat(database): implement sqlite schema, foreign keys, and seed script` |
| **Member 3** | **REST Endpoints** | Guest & Game CRUD controllers, booking handlers, and `GET /bookings/details` SQL JOIN endpoint | `feat(controllers): implement guest, game, and booking CRUD & join endpoints` |
| **Member 4** | **Validation & Search** | Input validation middleware (`validation.js`), email format/uniqueness, capacity search (`GET /games?players=4`) | `feat(middleware): add input validation and player capacity search` |
| **Member 5** | **Special Twist Rule** | Free on this date logic (`GET /games/available?date=YYYY-MM-DD`), date overlap prevention, and 3 mandatory test cases | `feat(twist): implement free on this date rule and mandatory test suite` |
| **Member 6** | **Postman & Documentation** | 18-request Postman test suite (`postman/BookNook.postman_collection.json`), `README.md`, setup instructions & demo guide | `docs: add comprehensive postman test suite, readme, and beginner guide` |

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
