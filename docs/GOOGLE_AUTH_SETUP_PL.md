# Konfiguracja Google OAuth 2.0 - Przewodnik PL 🇵🇱

**Szybka ściągawka po polsku dla Google Cloud Console**

---

## 🎯 Główne menu (po lewej stronie)

```
☰ Nawigacja
├── Pulpit
├── 📊 Interfejsy API i usługi ← TUTAJ!
│   ├── Panel kontrolny
│   ├── Biblioteka (Library) ← Tutaj włączasz API
│   ├── Dane logowania (Credentials) ← TUTAJ TWORZYSZ OAuth! 👈
│   ├── Ekran zgody OAuth
│   ├── Weryfikacja domeny
│   └── ...
├── IAM i administracja
└── ...
```

---

## 📝 Krok po kroku (PO POLSKU)

### 1️⃣ Utwórz projekt

1. U góry: **Wybierz projekt** → **Nowy projekt**
2. **Nazwa projektu**: `NetherList`
3. Kliknij: **Utwórz**
4. Poczekaj 10-20 sekund

### 2️⃣ Włącz Google+ API (opcjonalnie)

1. Menu: **Interfejsy API i usługi** → **Biblioteka**
2. Wyszukaj: "Google+ API"
3. Kliknij: **Włącz**

### 3️⃣ Utwórz dane logowania OAuth

1. Menu: **Interfejsy API i usługi** → **Dane logowania**
2. Kliknij: **+ UTWÓRZ DANE LOGOWANIA**
3. Wybierz: **Identyfikator klienta OAuth**

### 4️⃣ Skonfiguruj ekran zgody (jeśli pojawi się)

**Typ użytkownika:**
- ✅ Wybierz: **Zewnętrzny** (External)

**Informacje o aplikacji:**
- **Nazwa aplikacji**: `NetherList`
- **Adres e-mail wsparcia użytkowników**: Twój email
- **Logo aplikacji**: (opcjonalne)
- **Domena aplikacji**: (zostaw puste na razie)
- **Dane kontaktowe dewelopera**: Twój email
- Kliknij: **ZAPISZ I KONTYNUUJ**

**Zakresy:**
- Powinny być domyślnie: `email` i `profile`
- Jeśli nie ma - dodaj je
- Kliknij: **ZAPISZ I KONTYNUUJ**

**Użytkownicy testowi:**
- Kliknij: **+ ADD USERS** / **+ DODAJ UŻYTKOWNIKÓW**
- Wpisz swój email (do testowania)
- Kliknij: **ZAPISZ I KONTYNUUJ**

**Podsumowanie:**
- Sprawdź czy wszystko się zgadza
- Kliknij: **POWRÓT DO PULPITU**

### 5️⃣ Utwórz identyfikator klienta OAuth

Teraz wracasz do **Dane logowania** → **+ UTWÓRZ DANE LOGOWANIA** → **Identyfikator klienta OAuth**

**Typ aplikacji:**
- Wybierz: **Aplikacja webowa**

**Nazwa:**
- Wpisz: `NetherList Web Client`

**Autoryzowane źródła JavaScript:**
Kliknij **+ DODAJ IDENTYFIKATOR URI**, wpisz:
```
http://localhost:3000
```
Kliknij **+ DODAJ IDENTYFIKATOR URI** jeszcze raz, wpisz:
```
http://localhost:4000
```

**Autoryzowane identyfikatory URI przekierowań:**
Kliknij **+ DODAJ IDENTYFIKATOR URI**, wpisz:
```
http://localhost:4000/auth/google/callback
```

Kliknij: **UTWÓRZ**

### 6️⃣ ZAPISZ dane logowania! ⚠️

Po utworzeniu zobaczysz okno popup:

✅ **Identyfikator klienta** (Client ID):
```
123456789-abcdefg.apps.googleusercontent.com
```
👆 SKOPIUJ TO!

✅ **Kod dostępu klienta** (Client Secret):
```
GOCSPX-Abc123Xyz789
```
👆 SKOPIUJ TO!

**WAŻNE:** Zapisz te dane w notatniku! Będziesz ich potrzebować w `.env`

---

## 🔧 Gdzie wkleić dane?

### Backend: `backend/.env`

```bash
GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-Abc123Xyz789"
GOOGLE_CALLBACK_URL="http://localhost:4000/auth/google/callback"

SESSION_SECRET="tutaj-losowy-ciag-znakow-min-32-znaki"
JWT_SECRET="tutaj-inny-losowy-ciag"

DATABASE_URL="postgresql://netherlist:password@localhost:5432/netherlist_db"
REDIS_URL="redis://localhost:6379"
NODE_ENV="development"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
```

### Frontend: `frontend/.env.local`

```bash
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="losowy-ciag-znakow-min-32-znaki"

GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-Abc123Xyz789"

NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
NEXT_PUBLIC_WS_URL="ws://localhost:4000"
```

### Jak wygenerować losowe sekrety?

W PowerShell:
```powershell
# SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# NEXTAUTH_SECRET  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ❓ Częste problemy

### "Nie widzę opcji Dane logowania"

**Rozwiązanie:**
1. Sprawdź czy masz wybrany projekt (u góry, obok "Google Cloud")
2. W menu po lewej kliknij: **Interfejsy API i usługi**
3. Potem: **Dane logowania**

### "redirect_uri_mismatch" podczas logowania

**Rozwiązanie:**
1. Idź do: **Dane logowania** → Twój klient OAuth
2. Sprawdź czy w **Autoryzowane identyfikatory URI przekierowań** masz DOKŁADNIE:
   ```
   http://localhost:4000/auth/google/callback
   ```
3. Musi się zgadzać ze 100% (nawet `http` vs `https`!)

### "Access blocked: This app's request is invalid"

**Rozwiązanie:**
1. Idź do: **Ekran zgody OAuth**
2. W sekcji **Użytkownicy testowi** dodaj swój email
3. Albo opublikuj aplikację (przycisk **OPUBLIKUJ APLIKACJĘ**)

### "invalid_client"

**Rozwiązanie:**
1. Sprawdź czy `GOOGLE_CLIENT_ID` i `GOOGLE_CLIENT_SECRET` w `.env` są poprawne
2. Upewnij się że nie ma spacji przed/po wartościach
3. W razie problemów wygeneruj nowe dane logowania

---

## 🎯 Quick Links

- **Google Cloud Console:** https://console.cloud.google.com/
- **Dane logowania (bezpośrednio):** https://console.cloud.google.com/apis/credentials
- **Ekran zgody OAuth:** https://console.cloud.google.com/apis/credentials/consent

---

## ✅ Checklist

Przed rozpoczęciem kodowania upewnij się, że masz:

- [ ] Utworzony projekt w Google Cloud Console
- [ ] Skonfigurowany Ekran zgody OAuth
- [ ] Utworzony Identyfikator klienta OAuth
- [ ] Zapisany **Client ID** (Identyfikator klienta)
- [ ] Zapisany **Client Secret** (Kod dostępu klienta)
- [ ] Ustawione **Autoryzowane identyfikatory URI przekierowań**:
  - `http://localhost:4000/auth/google/callback`
- [ ] Ustawione **Autoryzowane źródła JavaScript**:
  - `http://localhost:3000`
  - `http://localhost:4000`
- [ ] Dodany swój email jako **użytkownik testowy**
- [ ] Skopiowane dane do `backend/.env`
- [ ] Skopiowane dane do `frontend/.env.local`
- [ ] Wygenerowane losowe sekrety (SESSION_SECRET, JWT_SECRET, NEXTAUTH_SECRET)

Wszystko gotowe? Możesz zacząć kodować! 🚀

---

## 📖 Pełna dokumentacja

Zobacz pełny przewodnik (PL + EN): [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)
