# Volksdev Uygulamasına Hoş Geldiniz

## Proje Bilgileri

Bu, [Volksdev] ile oluşturulmuş, çapraz platform destekli yerel (native) bir mobil uygulamadır.

**Platform**: Yerel iOS & Android uygulaması, web ortamına aktarılabilir
**Çatı (Framework)**: Expo Router + React Native

## Bu kodu nasıl düzenleyebilirim?

Yerel mobil uygulamanızı düzenlemenin birkaç yolu vardır.

### **Kendi kod düzenleyicinizi (IDE) kullanın**

Yerel olarak kendi kod düzenleyicinizle çalışmak isterseniz, bu depoyu klonlayabilir ve değişikliklerinizi gönderebilirsiniz. 

Kodlamaya yeniyseniz ve hangi düzenleyiciyi kullanacağınızdan emin değilseniz, Cursor'u öneririz. Terminallere aşinaysanız, Claude Code'u deneyebilirsiniz.

Tek gereksinim Node.js & Bun'ın kurulu olmasıdır - [nvm ile Node.js kurun](https://github.com/nvm-sh/nvm) ve [Bun kurun](https://bun.sh/docs/installation)

Şu adımları izleyin:

```bash
# Adım 1: Projenin Git URL'sini kullanarak depoyu klonlayın.
git clone <SİZİN_GIT_URL>

# Adım 2: Proje dizinine gidin.
cd <PROJE_ADINIZ>

# Adım 3: Gerekli bağımlılıkları kurun.
bun i

# Adım 4: Uygulamanızın web önizlemesini tarayıcınızda başlatın (Değişiklikleriniz otomatik yenilenir)
bun run start-web

# Adım 5: iOS önizlemesini başlatın
# Seçenek A (önerilen):
bun run start  # ardından terminalde "i" tuşuna basarak iOS Simulator'ı açın
# Seçenek B (ortamınız destekliyorsa):
bun run start -- --ios
```

### **Doğrudan GitHub üzerinden düzenleyin**

- İstenilen dosya(lar)a gidin.
- Dosya görünümünün sağ üst köşesindeki "Düzenle" düğmesine (kalem simgesi) tıklayın.
- Değişikliklerinizi yapın ve kaydedin (commit).

## Bu proje için hangi teknolojiler kullanıldı?

Bu proje, en popüler yerel mobil çapraz platform teknoloji yığını ile oluşturulmuştur:

- **React Native** - Meta tarafından oluşturulan ve Instagram, Airbnb ile App Store'daki birçok üst düzey uygulama tarafından kullanılan çapraz platform yerel mobil geliştirme çatısı
- **Expo** - React Native'in genişletilmiş hali + Discord, Shopify, Coinbase, Tesla, Starlink gibi platformlar tarafından kullanılıyor
- **Expo Router** - Web, sunucu fonksiyonları ve SSR destekli React Native için dosya tabanlı yönlendirme sistemi
- **TypeScript** - Tip güvenli JavaScript
- **React Query** - Sunucu durum yönetimi
- **Lucide React Native** - Harika simgeler

## Uygulamamı nasıl test edebilirim?

### **Telefonunuzda (Önerilen)**

1. **iOS**: App Store'dan [Expo Go](https://apps.apple.com/app/expo-go/id982107779) uygulamasını indirin.
2. **Android**: Google Play'den [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) uygulamasını indirin.
3. `bun run start` komutunu çalıştırın ve geliştirme sunucunuzdan çıkan QR kodunu tarayın.

### **Tarayıcınızda**

Bir web tarayıcısında test etmek için `bun start-web` komutunu çalıştırın. Not: Tarayıcı önizlemesi hızlı testler için harikadır, ancak bazı yerel özellikler kullanılamayabilir.

### **iOS Simulator / Android Emulator**

Uygulamalarınızı Expo Go'da test edebilirsiniz. Çoğu özellik için XCode veya Android Studio'ya ihtiyacınız yoktur.

**Ne Zaman Özel Geliştirme Derlemelerine (Custom Development Builds) İhtiyacınız Olur?**

- Yerel kimlik doğrulama (Face ID, Touch ID, Apple Sign In vb.)
- Uygulama içi satın alımlar ve abonelikler
- Anlık bildirimler (Push notifications)
- Özel yerel modüller

Daha fazla bilgi için: [Expo Custom Development Builds Rehberi](https://docs.expo.dev/develop/development-builds/introduction/)

Eğer XCode (iOS) veya Android Studio kuruluysa:

```bash
# iOS Simulator
bun run start -- --ios

# Android Emulator
bun run start -- --android
```

## Bu projeyi nasıl yayınlayabilirim (Deploy)?

### **App Store'da Yayınla (iOS)**

1. **EAS CLI Kurulumu**:

   ```bash
   bun i -g @expo/eas-cli
   ```

2. **Projenizi Yapılandırın**:

   ```bash
   eas build:configure
   ```

3. **iOS için Derleyin**:

   ```bash
   eas build --platform ios
   ```

4. **App Store'a Gönderin**:
   ```bash
   eas submit --platform ios
   ```

Detaylı talimatlar için [Expo'nun App Store dağıtım rehberini](https://docs.expo.dev/submit/ios/) ziyaret edebilirsiniz.

### **Google Play'de Yayınla (Android)**

1. **Android için Derleyin**:

   ```bash
   eas build --platform android
   ```

2. **Google Play'e Gönderin**:
   ```bash
   eas submit --platform android
   ```

Detaylı talimatlar için [Expo'nun Google Play dağıtım rehberini](https://docs.expo.dev/submit/android/) ziyaret edebilirsiniz.

### **Web Sitesi Olarak Yayınla**

React Native uygulamanız web üzerinde de çalışabilir:

1. **Web için Derleyin**:

   ```bash
   eas build --platform web
   ```

2. **EAS Hosting ile Yayınlayın**:
   ```bash
   eas hosting:configure
   eas hosting:deploy
   ```

Alternatif web dağıtım seçenekleri:

- **Vercel**: Doğrudan GitHub deponuzdan yayınlayın
- **Netlify**: Otomatik dağıtımlar için GitHub deponuzu Netlify'a bağlayın

## Uygulama Özellikleri

Bu şablon şunları içerir:

- **Çapraz platform uyumluluğu** - iOS, Android ve Web üzerinde çalışır
- Expo Router ile **dosya tabanlı yönlendirme**
- Özelleştirilebilir sekmeli **Tab navigation**
- Katmanlar ve iletişim kutuları için **Modal ekranlar**
- Daha iyi bir geliştirme deneyimi için **TypeScript desteği**
- Yerel veri kalıcılığı için **Async storage**
- Lucide React Native ile **Vektörel simgeler**

## Proje Yapısı

```
├── app/                    # Uygulama ekranları (Expo Router)
│   ├── (tabs)/            # Sekme gezinme ekranları
│   │   ├── _layout.tsx    # Sekme yapılandırması
│   │   └── index.tsx      # Ana sekme ekranı
│   ├── _layout.tsx        # Kök yapılandırma (Root layout)
│   ├── modal.tsx          # Örnek modal ekranı
│   └── +not-found.tsx     # 404 sayfası
├── assets/                # Statik dosyalar
│   └── images/           # Uygulama simgeleri ve görselleri
├── constants/            # Uygulama sabitleri ve yapılandırma
├── app.json             # Expo yapılandırması
├── package.json         # Bağımlılıklar ve scriptler
└── tsconfig.json        # TypeScript yapılandırması
```

## Özel Geliştirme Derlemeleri (Custom Development Builds)

Gelişmiş yerel özellikler için Expo Go yerine bir Özel Geliştirme Derlemesi oluşturmanız gerekir.

### **Zaman Özel Geliştirme Derlemesine İhtiyacınız Olur?**

- **Yerel Kimlik Doğrulama**: Face ID, Touch ID, Apple Sign In, Google Sign In
- **Uygulama İçi Satın Alımlar**: App Store ve Google Play abonelikleri
- **Gelişmiş Yerel Özellikler**: Üçüncü taraf SDK'lar, platforma özgü özellikler (örn. iOS'ta Widget'lar)
- **Arka Plan İşlemleri**: Arka plan görevleri, konum takibi

### **Özel Geliştirme Derlemesi Nasıl Oluşturulur**

```bash
# EAS CLI'yi kurun
bun i -g @expo/eas-cli

# Projenizi geliştirme derlemeleri için yapılandırın
eas build:configure

# Cihazınız için bir geliştirme derlemesi oluşturun
eas build --profile development --platform ios
eas build --profile development --platform android

# Geliştirme derlemesini cihazınıza yükleyin ve geliştirmeye başlayın
bun start --dev-client
```

**Daha fazlasını öğrenin:**

- [Geliştirme Derlemelerine Giriş](https://docs.expo.dev/develop/development-builds/introduction/)
- [Geliştirme Derlemeleri Oluşturma](https://docs.expo.dev/develop/development-builds/create-a-build/)
- [Geliştirme Derlemelerini Yükleme](https://docs.expo.dev/develop/development-builds/installation/)

## Sorun Giderme

### **Uygulama cihazda yüklenmiyor mu?**

1. Telefonunuzun ve bilgisayarınızın aynı WiFi ağında olduğundan emin olun
2. Tünel modunu kullanmayı deneyin: `bun start -- --tunnel`
3. Güvenlik duvarınızın bağlantıyı engelleyip engellemediğini kontrol edin

### **Derleme (Build) başarısız mı oluyor?**

1. Önbelleğinizi temizleyin: `bunx expo start --clear`
2. `node_modules` klasörünü silip yeniden yükleyin: `rm -rf node_modules && bun install`
3. [Expo'nun sorun giderme rehberini](https://docs.expo.dev/troubleshooting/build-errors/) inceleyin

## Volksdev Hakkında

Volksdev, Discord, Shopify, Coinbase, Instagram ve App Store'daki en iyi 100 uygulamanın neredeyse %30'u tarafından kullanılan React Native ve Expo teknolojilerini kullanarak tamamen yerel mobil uygulamalar oluşturur.

Uygulamanız üretime (production) hazırdır ve hem App Store hem de Google Play Store'da yayımlanabilir. Ayrıca tamamen çapraz platform olmasını sağlamak için uygulamanızı web üzerinde çalışacak şekilde de dışa aktarabilirsiniz.
