# 🔐 Настройка GitHub Secrets для Supabase

## ✅ Шаги для безопасности при заливе на GitHub

### 1️⃣ Убедись, что `.env` файл НЕ коммитится

✅ Создал `.gitignore` с исключением `.env` - готово!

Проверь:
```bash
git status
# .env должен быть в списке ignored files
```

### 2️⃣ Создай GitHub Secrets

Ты уже создал на GitHub:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Точно убедись, что эти переменные добавлены в:**
`Settings → Secrets and variables → Actions`

![image](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

### 3️⃣ Проверь, что GitHub Actions используют Secrets

✅ Обновил `.github/workflows/deploy.yml` - теперь при сборке используются GitHub Secrets:

```yaml
- name: Build project
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
  run: npm run build
```

### 4️⃣ Как работает при пуше

1. Ты пушишь код на GitHub
2. GitHub Actions запускается автоматически
3. Во время сборки из Secrets передаются переменные окружения
4. Приложение собирается с этими переменными
5. Результат (dist/) деплоится на GitHub Pages

### 5️⃣ Локальная разработка

Для локальной работы используй `.env` файл:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**⚠️ НИКОГДА не коммитьте `.env` файл!**

---

## 🔎 Проверка безопасности

### ✅ Что защищено:

- ✅ `.env` файл в `.gitignore` → не будет залит на GitHub
- ✅ Реальные ключи в GitHub Secrets (зашифрованы) → скрыты от публичного доступа
- ✅ GitHub Actions использует Secrets при сборке → безопасная передача
- ✅ `.env.example` показывает структуру, но без реальных ключей

### ❌ Что было проблемой:

- ❌ Отсутствовал `.gitignore` → .env могли бы залить на GitHub
- ❌ В `supabase.ts` были hardcoded реальные ключи → утечка данных
- ❌ `deploy.yml` не использовал Secrets → переменные не передавались при сборке

---

## 🚨 Если случайно залил .env на GitHub:

1. **Немедленно ротируй API ключи** в Supabase:
   ```
   Supabase Dashboard → Settings → API Keys → Rotate
   ```

2. **Очисти git историю:**
   ```bash
   git filter-branch --tree-filter 'rm -f .env' HEAD
   git push origin --force-with-lease
   ```

3. **Обнови GitHub Secrets** новыми ключами

---

## 📚 Ресурсы

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/self-hosting/security/gotchas)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
