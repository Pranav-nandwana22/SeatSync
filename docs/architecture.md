# SeatSync Architecture & Domain Model

## 1. Project Scope
SeatSync is a high-concurrency seat reservation system designed to handle simultaneous booking requests. The primary engineering objective is resolving race conditions and preventing double-booking using temporary distributed locks (Redis) while maintaining a durable source of truth (MongoDB).

## 2. Roles
* **User:** Browses events, views real-time seat availability, and reserves seats.
* **Admin:** Manages inventory by creating venues, events, shows, and generating seat maps.

## 3. High-Level Architecture
```text
                    SeatSync
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     Client          Server        Database
    (React)       (Node/Express)   (MongoDB)
                       │
                   ┌───┴────┐
                   ▼        ▼
                Redis     BullMQ
               (Locks)   (Workers)
```

## 4. Core Booking Lifecycle
The state machine for a single Seat instance:
1. **AVAILABLE:** Default state.
2. **HELD:** A user selects the seat. A temporary lock with a TTL is placed in Redis. Other users see this seat as unavailable.
3. **BOOKED:** Payment/confirmation succeeds. The durable state in MongoDB is updated to BOOKED.
* *Fallback:* If the Redis TTL expires before confirmation or payment fails, the hold drops, and the seat reverts to **AVAILABLE**.

## 5. Core Entities (Domain Model)
* **User:** The authenticated entity interacting with the system.
* **Venue:** The physical location (e.g., a specific theater).
* **Event:** The abstract event (e.g., "Oppenheimer", "Rock Concert").
* **Show:** A specific instance of an Event at a specific Venue and time.
* **Seat:** The individual physical unit of inventory linked to a Show.
* **Booking:** The transactional record linking a User, Show, and Seat(s).