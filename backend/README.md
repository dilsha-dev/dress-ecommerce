# Django + DRF Backend — Dress E-Commerce API

A Django REST Framework backend that provides full CRUD operations for the
dress e-commerce storefront. It uses **MySQL** as its database and exposes
a JSON API the React frontend can consume.

---

## Tech Stack

| Layer        | Technology                       |
| ------------ | -------------------------------- |
| Framework    | Django 4.2+                      |
| API          | Django REST Framework            |
| Database     | MySQL (via PyMySQL)              |
| CORS         | django-cors-headers              |

---

## Project Structure

```
backend/
├── manage.py                 # Django CLI entry point
├── requirements.txt          # Python dependencies
└── backend/                  # Django project package
    ├── __init__.py
    ├── settings.py           # MySQL config, CORS, DRF settings
    ├── urls.py               # Root URL conf (mounts /api/dresses/)
    ├── wsgi.py
    └── asgi.py
└── dresses/                  # Dresses app
    ├── __init__.py
    ├── apps.py
    ├── admin.py              # Django admin registration
    ├── models.py             # Dress model
    ├── serializers.py        # DressSerializer
    ├── views.py              # List/Create + Detail/Update/Delete views
    └── urls.py               # App-level routes
```

---

## Setup

### 1. Create & activate a virtual environment

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure the database

Create a MySQL database:

```sql
CREATE DATABASE dress_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Set the connection details via environment variables (or edit `settings.py`):

```bash
export MYSQL_DATABASE=dress_shop
export MYSQL_USER=root
export MYSQL_PASSWORD=yourpassword
export MYSQL_HOST=127.0.0.1
export MYSQL_PORT=3306
```

### 4. Run migrations

```bash
python manage.py makemigrations dresses
python manage.py migrate
```

### 5. (Optional) Load seed data

```bash
python manage.py shell
```

```python
from dresses.models import Dress
Dress.objects.create(
    name="Floral Summer Sundress",
    description="A breezy floral sundress.",
    price="49.99",
    category="Summer",
    sizes=["S", "M", "L"],
    colors=["Yellow", "Pink"],
    stock=45,
    image_url="https://images.pexels.com/photos/6181955/pexels-photo-6181955.jpeg",
)
```

### 6. Create an admin user (optional)

```bash
python manage.py createsuperuser
```

### 7. Start the dev server

```bash
python manage.py runserver
```

The API is now available at **http://127.0.0.1:8000/api/dresses/**
and the Django admin at **http://127.0.0.1:8000/admin/**.

---

## API Endpoints

| Method | Endpoint                    | Description                              |
| ------ | --------------------------- | ---------------------------------------- |
| GET    | `/api/dresses/`             | List dresses (active only)               |
| POST   | `/api/dresses/`             | Create a new dress                       |
| GET    | `/api/dresses/<id>/`        | Retrieve a single dress                  |
| PUT    | `/api/dresses/<id>/`        | Full update                              |
| PATCH  | `/api/dresses/<id>/`        | Partial update                           |
| DELETE | `/api/dresses/<id>/`        | Soft delete (sets `is_deleted=true`)     |
| DELETE | `/api/dresses/<id>/?hard=true` | Hard delete (removes row permanently) |
| POST   | `/api/dresses/<id>/restore/`| Restore a soft-deleted dress             |

### Query Parameters for GET `/api/dresses/`

| Param           | Type    | Example                         |
| ---------------- | ------- | ------------------------------- |
| `search`         | string  | `?search=floral`                |
| `category`       | string  | `?category=Summer`              |
| `size`           | string  | `?size=M`                       |
| `color`          | string  | `?color=Red`                    |
| `min_price`      | number  | `?min_price=50`                 |
| `max_price`      | number  | `?max_price=100`                |
| `ordering`       | string  | `?ordering=-price`              |
| `include_deleted`| boolean | `?include_deleted=true`         |

### Sample Create Request

```json
POST /api/dresses/
{
    "name": "Red Cocktail Dress",
    "description": "A bold red cocktail dress.",
    "price": "129.00",
    "category": "Cocktail",
    "sizes": ["XS", "S", "M", "L"],
    "colors": ["Red", "Burgundy"],
    "stock": 30,
    "image_url": "https://example.com/dress.jpg",
    "gallery": []
}
```

### Sample Response

```json
{
    "id": 1,
    "name": "Red Cocktail Dress",
    "description": "A bold red cocktail dress.",
    "price": "129.00",
    "category": "Cocktail",
    "sizes": ["XS", "S", "M", "L"],
    "colors": ["Red", "Burgundy"],
    "stock": 30,
    "image_url": "https://example.com/dress.jpg",
    "gallery": [],
    "is_deleted": false,
    "in_stock": true,
    "is_low_stock": false,
    "created_at": "2026-09-27T10:00:00Z",
    "updated_at": "2026-09-27T10:00:00Z"
}
```

---

## CORS

The API allows requests from the following origins by default:

- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`

Set `CORS_ALLOW_ALL_ORIGINS = True` (already the default for dev) or add
your production frontend URL to `CORS_ALLOWED_ORIGINS` in `settings.py`.

---

## Production Notes

1. Set `DEBUG = False` and a strong `SECRET_KEY` via env vars.
2. Configure `ALLOWED_HOSTS` to your domain(s).
3. Restrict `CORS_ALLOWED_ORIGINS` to your actual frontend URL(s).
4. Change `DEFAULT_PERMISSION_CLASSES` from `AllowAny` to
   `IsAuthenticatedOrReadOnly` (or a custom admin-only permission) for
   write operations.
5. Use Gunicorn or uWSGI behind a reverse proxy (Nginx/Apache).
6. Serve static/media files via your web server or a CDN in production.
```
[truncated for brevity — full file written to disk]
