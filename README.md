# LUXÉ — Multi-Vendor E-Commerce Platform

A premium multi-vendor e-commerce marketplace built with **FastAPI**, **Next.js**, and **PostgreSQL**. Designed for luxury goods, independent makers, and curated collections.

---

## 🚀 Tech Stack

### Backend
- **FastAPI** — High-performance Python web framework
- **PostgreSQL** — Relational database
- **Redis** — Caching & session management
- **SQLAlchemy** — ORM
- **Alembic** — Database migrations
- **Celery** — Background task processing
- **Stripe** — Payment processing
- **Cloudinary** — Image storage & management
- **Docker** — Containerization

### Frontend
- **Next.js 16** — React framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling

### DevOps
- **Railway** — Cloud deployment
- **GitHub Actions** — CI/CD pipeline
- **Docker Compose** — Local development

---

## 📁 Project Structure

```
multi-vendor-ecommerce/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── models/          # Database models
│   │   ├── routers/         # API routes
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # Business logic
│   ├── tests/               # Test suite
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app directory
│   │   ├── components/      # Reusable components
│   │   └── lib/             # Utilities & API clients
│   ├── public/
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml           # CI/CD pipeline
└── railway.json             # Railway deployment config
```

---

## ⚡ Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Node.js 20+](https://nodejs.org)
- [Python 3.11+](https://www.python.org)

### 1. Clone the repository
```bash
git clone https://github.com/kadiwalaaman/multi-vendor-ecommerce.git
cd multi-vendor-ecommerce
```

### 2. Start the backend (with Docker)
```bash
docker-compose -f backend/docker-compose.yml up
```

This starts:
- 🐍 FastAPI backend on `http://localhost:8000`
- 🐘 PostgreSQL on port `5432`
- 🔴 Redis on port `6379`

### 3. Start the frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## 📖 API Documentation

Once the backend is running, visit:

- **Swagger UI** → [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc** → [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login & get access token |
| GET | `/auth/me` | Get current user |
| GET | `/products/` | List all products |
| POST | `/products/` | Create a product (vendor) |
| GET | `/products/{id}` | Get product details |
| PUT | `/products/{id}` | Update product (vendor) |
| DELETE | `/products/{id}` | Delete product (vendor) |

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/ecommerce
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_your_stripe_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🧪 Running Tests

```bash
cd backend
pytest tests/ -v
```

---

## 🚢 Deployment

This project is deployed on **Railway**.

- Backend is containerized with Docker
- Railway auto-deploys on every push to `main`
- CI/CD pipeline runs tests before deployment

### Deploy your own
1. Fork this repository
2. Create a new project on [Railway](https://railway.app)
3. Connect your GitHub repository
4. Add environment variables in Railway dashboard
5. Deploy! 🚀

---

## ✨ Features

- 👤 **Multi-role authentication** — Customer, Vendor, Admin
- 🛍️ **Product management** — Full CRUD for vendors
- 💳 **Stripe payments** — Secure checkout
- 📦 **Order management** — Track orders in real time
- 🖼️ **Image uploads** — Cloudinary integration
- ⚡ **Redis caching** — Fast API responses
- 📧 **Email notifications** — Order confirmations
- 🔒 **JWT authentication** — Secure & stateless
- 📊 **Vendor dashboard** — Sales analytics
- 🌐 **RESTful API** — Well-documented endpoints

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Aman Kadiwala**
- GitHub: [@kadiwalaaman](https://github.com/kadiwalaaman)

---

<p align="center">Built with ❤️ for the discerning.</p>
