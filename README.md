# BuBilet - Otobüs Bileti Rezervasyon Sistemi

Online otobüs bileti rezervasyon sistemi.

## Özellikler

- Kullanıcı kaydı ve girişi
- Sefer arama
- Koltuk seçimi
- Rezervasyon oluşturma ve iptal
- Rezervasyon geçmişi

## Teknolojiler

- Frontend: React, Material-UI
- Backend: Node.js, Express
- Veritabanı: PostgreSQL
- Authentication: JWT
- Container: Docker

## Kurulum

### Geliştirme Ortamı

1. Repoyu klonlayın:
```bash
git clone https://github.com/kullaniciadi/bubilet.git
cd bubilet
```

2. Backend için gerekli paketleri yükleyin:
```bash
cd backend
npm install
```

3. Frontend için gerekli paketleri yükleyin:
```bash
cd frontend
npm install
```

4. PostgreSQL veritabanını oluşturun:
```bash
psql -U postgres
CREATE DATABASE ticket_system;
```

5. Veritabanı tablolarını ve örnek verileri yükleyin:
```bash
cd backend
npm run db:reset
```

6. Backend ve Frontend için .env dosyalarını oluşturun:

Backend (.env):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ticket_system
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h
PORT=3001
```

Frontend (.env):
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### Docker ile Kurulum

```bash
docker-compose up --build
```

## Kullanım

1. Frontend: http://localhost:3000
2. Backend: http://localhost:3001

## Lisans

MIT 