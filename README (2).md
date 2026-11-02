# Defter Notları WEB TABANLI UYGULAMALAR

## Hafta 1

### Oyun Programlama: Unity Kavramları

Kavramları kısa tanımları ve derste kullanılan benzetmeleriyle yaz:

- **Unity Hub:** Unity projelerini ve Unity sürümlerini yönettiğimiz araç kutusu.
- **LTS:** Uzun Süreli Destek; daha kararlı ve uzun süre desteklenen sürüm.
- **Visual Studio:** Unity için kod yazıp düzenlediğimiz program.
- **Scene:** Oyunu hazırladığımız çalışma alanı; film seti gibi düşünülebilir.
- **Game:** Oyuncunun gördüğü oyun ekranı.
- **Hierarchy:** Sahnedeki nesnelerin isim listesi.
- **Project:** Oyun dosyalarının (ses, resim, kod vb.) bulunduğu depo.
- **Inspector:** Seçili nesnenin özelliklerini görüntüleyip değiştirdiğimiz panel.

### Grafik ve Photoshop

#### Çözünürlük ve renk modu

Aşağıdaki soruları cevaplayarak yaz:

- Matbaada afiş basmak için gereken en düşük çözünürlük ve renk modu nedir?
- Yalnızca Instagram'da paylaşılacak bir tasarım için çözünürlük ve renk modu ne olmalıdır?

#### Photoshop araçları

Photoshop Araç Kutusu'ndan üç araç seç. Her birinin simgesini çizip İngilizce adını ve kısayol harfini yanına yaz. Örnek: **Move Tool - V**.

#### Grafik türleri, bit derinliği ve dosya biçimleri

- Vektörel grafiğin matematiksel formüllere dayalı çizimini yap.
- Piksel tabanlı grafiğin ızgara/piksellerden oluşan çizimini yap.
- **Bit derinliği:** `2^8 = 256` hesabını not et.
- **PSD:** Photoshop'un düzenlenebilir çalışma dosyası.
- **JPG/JPEG:** Fotoğraflarda sık kullanılan, sıkıştırılmış biçim; şeffaf arka planı desteklemez.
- **PNG:** Şeffaf arka planı destekleyebilir; logo ve arka planı kaldırılmış görsellerde kullanılır.

### Web Tabanlı Uygulama: Temel Kavramlar

#### İnternetin temel yapı taşları

- **IP adresi:** İnternete bağlı cihazı tanımlayan sayısal adres.
- **DNS:** Alan adlarını IP adreslerine çeviren sistem; internetin telefon rehberi.
- **Sunucu (Server):** Web sitelerini ve dosyaları barındırıp istekleri yanıtlayan bilgisayar.
- **HTTP:** Tarayıcı ile sunucu arasında web verilerinin aktarım kuralları.
- **HTTPS:** İletişimi şifreleyerek güvenli hale getiren HTTP sürümü.

#### Web sitesinin adresi ve konumu

- **Domain (Alan adı):** IP adresi yerine kullanılan, akılda kalıcı web sitesi adı.
- **URL:** Bir web kaynağının internetteki tam adresi.
- **WWW (World Wide Web):** URL'lerle erişilen, birbirine bağlı web sayfaları ve içeriklerden oluşan sistem.
- **Hosting (Barındırma):** Web sitesi dosyalarının internetten erişilebilen sunucuda tutulması hizmeti.
- **FTP:** Bilgisayar ile sunucu arasında dosya aktarma protokolü.

#### Web sayfasının yapısı ve görünümü

- **HTML:** Web sayfasının başlık, paragraf ve resim gibi içeriğini/yapısını oluşturan işaretleme dili.
- **Etiket (Tag):** HTML'de bir elementi tanımlayan, `<` ve `>` işaretleri arasındaki ifade. Örnek: `<p>`.
- **CSS:** Web sayfasının renk, yazı tipi ve yerleşim gibi görsel özelliklerini belirleyen dil.
- **JavaScript (JS):** Web sayfalarına etkileşim ve dinamizm katan programlama dili.

#### Web geliştirme rolleri ve araçları

- **Front-end (Ön yüz):** Kullanıcının tarayıcıda gördüğü ve etkileştiği arayüz.
- **Back-end (Arka yüz):** Sunucu, veritabanı ve iş mantığı gibi kullanıcıya görünmeyen sistemler.
- **Full-stack (Tam yığın):** Hem ön yüz hem arka yüz geliştirme.
- **Tarayıcı (Browser):** Web sayfalarını görüntüleyip kullanmamızı sağlayan yazılım.
- **Kod editörü:** HTML ve CSS gibi kodları yazıp düzenlediğimiz program; örnek: VS Code.
- **WYSIWYG editör:** Kod yazmadan görsel araçlarla sayfa oluşturan, “Ne Görürsen Onu Alırsın” yaklaşımındaki editör.

#### Yaygın alan adı uzantıları

- **.gov:** Devlet kurumları
- **.edu:** Eğitim kurumları
- **.k12:** Temel eğitim ve ortaöğretim kurumları
- **.org:** Ticari olmayan kuruluşlar
- **.com:** Ticari kuruluşlar

## Hafta 2

### Grafik ve Photoshop: Kısayol Sözlüğü

Kısayolları defterine sözlük olarak yaz ve ezberle:

- **V:** Taşıma Aracı (Move Tool); işlemler arasında seçili araca dönmek için kullanılır.
- **Z:** Büyüteç (Zoom); yakınlaştırır. **Alt** ile tıklamak uzaklaştırır.
- **Boşluk (Space):** El Aracı (Pan); sayfa içinde gezinmeyi sağlar.
- **C:** Kırpma Aracı (Crop Tool); görüntünün fazlalıklarını keser.
- **J:** Yara Bandı (Spot Healing); küçük leke ve kusurları siler.
- **B:** Fırça Aracı (Brush Tool); boyama yapar.
- **Ctrl + N:** Yeni belge oluşturur (New Document).
- **Ctrl + O:** Var olan dosyayı açar (Open).
- **Ctrl + Z:** Son işlemi geri alır (Undo).
- **Ctrl + D:** Seçimi kaldırır (Deselect).
- **Ctrl + Shift + N:** Yeni katman oluşturur (New Layer).
- **Ctrl + S:** Dosyayı kaydeder (Save).

### Oyun Programlama: Kod Sözlüğü

Kavramları kendi anlayacağın dille, kısaca yaz:

- **Script:** Oyundaki nesnelere ne yapacaklarını söyleyen kod dosyası.
- **`void Start()`:** Oyun başladığında bir kez çalışan kod bölümü.
- **`void Update()`:** Oyun açık olduğu sürece sürekli çalışan kod bölümü.
- **`Debug.Log()`:** Unity Konsolu'na mesaj yazdırmaya ve hata ayıklamaya yarayan komut.
- **`public`:** Değişkeni Unity Inspector panelinde görünür ve düzenlenebilir yapan erişim belirleyicisi.
- **`transform.Translate`:** Nesneyi X, Y veya Z yönünde hareket ettirmek için kullanılan kod.

### Web Tabanlı Uygulama: Web Tasarımın 7 İlkesi

İlkeleri defterine yaz:

1. **İçerik:** Yazı, resim ve videoların özgün, doğru ve hedef kitleye uygun olması.
2. **Tasarım (Layout):** Logo, menü ve içeriklerin sayfada nasıl yerleşeceğinin planlanması.
3. **Biçimsellik:** Renk uyumu, kontrast ve okunabilir yazı tiplerinin (tipografi) kullanılması.
4. **İşlevsellik ve kullanılabilirlik:** Sitenin hızlı çalışması; menü ve butonların doğru, kullanımın kolay olması.
5. **Güncellik:** İçeriklerin güncel, kullanılan teknolojilerin modern olması.
6. **Uygunluk ve güvenilirlik:** İletişim bilgilerinin bulunması, bağlantıların çalışması ve yazım hatalarının olmaması.
7. **Uyumluluk:** Sitenin farklı tarayıcı ve cihazlarda bozulmadan çalışması; duyarlı (responsive) tasarım.

## Hafta 3

### Bilgiler

1. `<!DOCTYPE html>`

Tarayıcıya HTML5 standartlarını kullandığımızı belirten zorunlu koddur.

2. `<meta name="viewport"...>`

Sitenin cep telefonlarında ve tabletlerde bozulmadan, ekrana duyarlı (Responsive) çalışmasını sağlayan etikettir.

### BAŞLIK HİYERARŞİSİ

- Bir sayfada sadece bir tane `<h1>` (Ana Başlık) kullanılır.
- Sıralama atlanamaz. Örneğin `<h2>`'den sonra `<h4>` yazılamaz, `<h3>` gelmelidir.
- Başlık etiketleri yazıyı büyütmek için değil, sayfanın içindekiler tablosunu oluşturmak için kullanılır.
- Yazı büyütme işi CSS ile yapılır.

### ANLAMSAL (SEMANTIC) ETİKETLER

`<header>` : Başlık ve Logo alanı.

`<nav>` : Menü (Link) alanı.

`<main>` : Sitenin ana içeriği.

`<article>` : Bağımsız makale/haber bloğu.

`<section>` : İçerik içindeki alt bölümler.

`<aside>` : Ana içeriğin yanında duran yan bilgiler (Kenar çubuğu).

`<footer>` : En alt kısımdaki telif/iletişim alanı.

### ANLAMSAL METİN BİÇİMLENDİRME

`<strong>` : Kalın yapar ama arama motoruna "bu kelime çok önemli" der.

`<em>` : İtalik yapar ama "bu kelimeye vurgu yap" der.

`<!-- Yorum -->` : Tarayıcıda görünmeyen, sadece kodlayıcının gördüğü notlardır.

## Hafta 4

### CSS Seçicileri


1. **Etiket Seçici (`body`, `h1`):** HTML etiketinin adıyla doğrudan seçer. Sayfadaki tüm o etiketleri etkiler.

2. **Kimlik (ID) Seçici (`#logo`):** HTML'de `id="logo"` olan elemanı seçer. Bir sayfada bir ID sadece **1 kez** kullanılır. Başına `#` konur.

3. **Sınıf (Class) Seçici (`.gezegen-karti`):** HTML'de `class="gezegen-karti"` olan elemanları seçer. Birden fazla elemanda kullanılabilir. Başına `.` (nokta) konur.

4. **Torun (Descendant) Seçici (`.gezegen-karti img`):** Aralarında boşluk bırakılarak yazılır. Bir kutunun içindeki (ne kadar derinde olursa olsun) elemanları seçer.

5. **Sözde Sınıf (Pseudo-Class) (`:hover`):** Kullanıcı fare ile elemanın üzerine geldiği anki stilini belirler.

6. **Sözde Eleman (Pseudo-Element) (`::first-letter`, `::selection`):** Elemanın sadece belirli bir parçasını (ilk harfini veya fareyle seçilen kısmını) hedef alır. Çift iki nokta `::` ile yazılır.

## Hafta 5

### JavaScript Temel Kavramları

1. **JavaScript Nedir?:** Web sayfalarına mantık, karar verme yeteneği ve kullanıcı ile etkileşim katan programlama dilidir.
2. **DOM (Document Object Model):** JavaScript'in HTML etiketlerine müdahale edebilmesi için oluşturulan ağaç yapısıdır. `document.getElementById("Kutu")` kodu, HTML'deki ID'si "Kutu" olan elemanı bulup yakalamamızı sağlar.
3. **var / let (Değişkenler):** Bilgisayarın geçici hafızasında veri (sayı, metin) saklayan kutulardır.
4. **if / else:** Karar yapısıdır. Şart doğruysa (`if`) bir kodu, yanlışsa (`else`) başka bir kodu çalıştırır.
5. **switch - case:** Bir değişkenin alabileceği ÇOK FAZLA seçenek (durum) varsa, `if-else` yerine daha düzenli olan bu komut kullanılır. İşlem bitince `break;` ile çıkılır.
6. **return:** Bir fonksiyonun görevini bitirdikten sonra, kendisini çağıran yere bir değer "geri döndürmesi" işlemidir.

### URL ve Sayfa Yapısı Kavramları

1. **URL Parameters (Query Strings):** Web sayfaları arasında adres çubuğu üzerinden veri taşımak için kullanılır. Soru işareti `?` ile başlar. (Örn: `detay.html?id=50`)
2. **URLSearchParams:** JavaScript'in adres çubuğundaki parametreleri cımbızla yakalayıp okumasını sağlayan kodudur.
3. **Dinamik Sayfa (Dynamic Page):** İçeriği bizim elle yazmadığımız, URL'den gelen ID'ye göre API'den (Veritabanından) çekilen verilere göre saniyeler içinde şekil değiştiren sayfalardır (Örn: `detay.html`).
4. **`<iframe>`:** Kendi sitemizin içine başka bir web sitesini (YouTube, Google Maps vb.) gömmemizi sağlayan HTML etiketidir.

### API ve Asenkron Veri İşlemleri

1. **API (Uygulama Geliştirme Arayüzü):** İki farklı yazılımın birbiriyle konuşmasını ve veri alışverişi yapmasını sağlayan köprüdür.
2. **JSON (JavaScript Object Notation):** API'lerden bize gelen verilerin yazılış formatıdır. Anlaşılması kolay, hafif bir metin formatıdır.
3. **`fetch()` Metodu:** JavaScript'te internetten (bir URL'den) veri çekmek için kullanılan asıl fonksiyondur.
4. **`async / await`:** İnternetten veri çekmek zaman alacağı için JavaScript'e "bu işlem bitene kadar diğer kodlara geçme, bekle" diyen komutlardır (Asenkron programlama).
5. **Template Literals (`` ` ``) Backtick:** JavaScript içinde HTML kodlarını çok kolay yazmamızı sağlayan ve içine `${degisken}` şeklinde JS değerleri gömmemize olanak tanıyan özel tırnak işaretidir.


