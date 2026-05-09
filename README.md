# 🎓 School Management System (SMS)

A full-stack School Management System built with a **React** frontend and a **Spring Boot microservices** backend. It supports multiple roles — Admin, Instructor, Student, and Parent — each with their own scoped views and permissions.

---

## 📸 Features

| Feature | Admin | Instructor | Student | Parent |
|---|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Manage Students | ✅ | ✅ (own) | — | — |
| Manage Teachers | ✅ | — | — | — |
| Manage Courses | ✅ | ✅ (own) | view | view |
| Grades | ✅ | ✅ (own) | view own | view children |
| Labs | ✅ CRUD | view (own) | view (own) | — |
| Schedule | ✅ | ✅ | ✅ | ✅ |
| Enrollment | ✅ | — | ✅ | — |
| Parents | ✅ | — | — | — |
| Reports | ✅ | — | — | — |

---

## 🏗️ Architecture

The backend follows a **microservices architecture** with an API Gateway as the single entry point.

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│                  localhost:3000                      │
└─────────────────────┬───────────────────────────────┘
                      │ /api/* → proxied to :8080
┌─────────────────────▼───────────────────────────────┐
│              API Gateway  :8080                      │
│         (Spring Cloud Gateway + JWT Filter)          │
└──┬────────────┬────────────┬────────────┬───────────┘
   │            │            │            │
:8081        :8082        :8083        :8084
AuthService  AcademicService  StudentMgmt  GradingService
(auth_db)  (academicservice)  (student_db)  (grading_db)
```

### Microservices

| Service | Port | Database | Responsibilities |
|---|---|---|---|
| **API Gateway** | 8080 | — | JWT validation, request routing |
| **AuthService** | 8081 | `auth_db` | Login, user creation, JWT issuing |
| **AcademicService** | 8082 | `academicservice` | Courses, instructors, enrollments, labs |
| **StudentManagement** | 8083 | `student_db` | Students, parents |
| **GradingService** | 8084 | `grading_db` | Grades |

### Event Messaging

Services communicate async events via **Apache Kafka** on `localhost:9092`.  
Example: when a student enrolls in a course, `AcademicService` publishes an `EnrollmentEvent` consumed by `StudentManagement` and `GradingService`.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + Vite
- **React Router v6**
- **Bootstrap 5** + Bootstrap Icons
- **React Bootstrap**
- **Axios** (API calls)
- **Recharts** (dashboard charts)

### Backend
- **Java 17** + Spring Boot 3
- **Spring Cloud Gateway**
- **Spring Data JPA** + Hibernate
- **MySQL 8**
- **Apache Kafka**
- **JWT** (authentication)

---

## ⚙️ Prerequisites

Make sure the following are installed before running the project:

- **Java 17+**
- **Maven 3.8+**
- **Node.js 18+** + npm
- **MySQL 8**
- **Apache Kafka** (with Zookeeper)

---

## 🗄️ Database Setup

Create the 4 databases in MySQL:

```sql
CREATE DATABASE auth_db;
CREATE DATABASE academicservice;
CREATE DATABASE student_db;
CREATE DATABASE grading_db;
```

> The tables are auto-created by Spring Boot (`spring.jpa.hibernate.ddl-auto=update`) on first run.

### Default DB credentials used in the project

```
Host:     localhost:3306
Username: root
Password: 123456789
```

> ⚠️ To use a different username or password, update `application.properties` in each service before running.

---

## 🚀 Running the Project

### 1. Start Kafka & Zookeeper

```bash
# Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Start Kafka broker
bin/kafka-server-start.sh config/server.properties
```

> On Windows use `bin\windows\` instead of `bin\`.

---

### 2. Start Backend Services

Each service is a standalone Spring Boot app. Run them in this order:

```bash
# 1. Auth Service
cd Backend/AuthService
mvn spring-boot:run

# 2. Academic Service
cd Backend/academicservice
mvn spring-boot:run

# 3. Student Management
cd Backend/student_management
mvn spring-boot:run

# 4. Grading Service
cd Backend/grading
mvn spring-boot:run

# 5. API Gateway (start last)
cd Backend/api-gateway
mvn spring-boot:run
```

All 5 services must be running. The gateway starts on **port 8080** and all frontend API calls are routed through it.

---

### 3. Start Frontend

```bash
cd sms-frontend        # or wherever the frontend folder is
npm install
npm run dev
```

The app will be available at **http://localhost:3000**

The Vite dev server proxies all `/api/*` requests to `http://localhost:8080`, so no CORS issues.

---

## 📁 Project Structure

```
├── Backend/
│   ├── api-gateway/          # Spring Cloud Gateway + JWT filter
│   ├── AuthService/          # Auth & user management  (port 8081)
│   ├── academicservice/      # Courses, instructors, labs, enrollments  (port 8082)
│   ├── student_management/   # Students & parents  (port 8083)
│   └── grading/              # Grades  (port 8084)
│
└── sms-frontend/
    └── src/
        ├── components/
        │   ├── layout/       # Sidebar, Layout
        │   └── ui/           # Shared UI components
        ├── context/          # AuthContext (user session)
        ├── pages/            # One file per page
        ├── services/         # api.js — all Axios calls
        └── utils/            # helpers.js — ROLES, formatters
```

---

## 🔐 API Gateway Routing

| Path prefix | Routed to |
|---|---|
| `/auth/**` | AuthService :8081 |
| `/course/**` | AcademicService :8082 |
| `/enrollment/**`, `/instructor/**`, `/lab/**` | AcademicService :8082 |
| `/student/**`, `/parents/**` | StudentManagement :8083 |
| `/grades/**` | GradingService :8084 |

The gateway injects `X-User-Id`, `X-User-Role`, and `X-Internal-Secret` headers into every forwarded request so downstream services can authorize without re-parsing the JWT.

---

## 👤 Default Roles

| Role value | Description |
|---|---|
| `ADMIN` | Full access to all features |
| `INSTRACTOR` | Access to own students, courses, labs, grades |
| `STUDENT` | View own courses, grades, schedule, labs; enroll |
| `PARENT` | View courses, grades, schedule for linked children |

> Note: the role is stored as `INSTRACTOR` (intentional spelling in the DB schema).

---

## 🔧 Environment Configuration

If you need to change the DB password, JWT secret, or ports, edit the relevant `application.properties`:

**AuthService & API Gateway JWT secret** (must match):
```properties
jwt.secret=mySuperSecretKeyForJwtAuthentication123456
```

**Internal service secret** (must match across all services):
```java
// AuthHelper.java in each service
private static final String SECRET = "my-secret-key";
```

---

## 📦 Build for Production

### Frontend
```bash
cd sms-frontend
npm run build
# Output: sms-frontend/dist/
```

### Backend
```bash
cd Backend/<service-name>
mvn clean package -DskipTests
# Output: target/<service-name>-0.0.1-SNAPSHOT.jar
```

Run the jar:
```bash
java -jar target/<service-name>-0.0.1-SNAPSHOT.jar
```

---

## 🐛 Common Issues

**Students page shows "Access Denied" for Instructor**
→ Make sure `AuthHelper.java` in `student_management` allows the `INSTRACTOR` role in `checkOwnerByIdOrAdmin`.

**Delete instructor button does nothing**
→ The `Instructor` entity PK is `instructorId`, not `id`. Frontend must use `teacher.instructorId`.

**Grades page shows empty for Instructor**
→ The above student fetch failure silently causes no students → no grades. Fix the AuthHelper first.

**Kafka connection errors on startup**
→ Make sure Zookeeper is running before Kafka, and Kafka is running before the Spring Boot services.

---

## 📄 License

This project was built as an academic graduation project.
