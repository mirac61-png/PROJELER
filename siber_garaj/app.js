// 1. LOCALSTORAGE HAFIZASI VE GLOBAL DEĞİŞKENLER
let garajListesi = JSON.parse(localStorage.getItem("siberGaraj")) || [];
let gelenAraclar = [];
let indirimOrani = 1; // 1 = İndirim yok, 0.8 = %20 İndirim

// 2. JQUERY READY FONKSİYONU (Kitap Sayfa 196)
// Sayfa tamamen yüklendiğinde çalışacak jQuery kodları:
$(document).ready(function() {
    
    // Üstteki Kampanya Kupon Kutusunu Kaydırarak Aç/Kapat (slideToggle)
    $("#kampanyaBtn").click(function() {
        $("#kuponKutusu").slideToggle(400); // 400 milisaniyede kayarak açılır/kapanır
    });

    sayaciGuncelle();
    araclariGetir('vehicle'); // Vitrin sayfasındaysak otomobilleri getir
    garajTablosunuCiz();      // Garaj sayfasındaysak tabloyu çiz
});


// 3. CANLI API'DEN ARAÇ ÇEKME (index.html)
async function araclariGetir(kategori) {
    const listeKutusu = document.getElementById("arac-listesi");
    if (!listeKutusu) return; // Vitrin sayfasında değilsek dur

    listeKutusu.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-warning"></div><p class="mt-2">Araçlar Filodan Yükleniyor...</p></div>`;

    try {
        const cevap = await fetch(`https://dummyjson.com/products/category/${kategori}`);
        const veri = await cevap.json();
        gelenAraclar = veri.products;
        
        vitrineDiz(gelenAraclar);
    } catch (hata) {
        listeKutusu.innerHTML = `<div class="alert alert-danger">Sunucuya bağlanılamadı!</div>`;
    }
}

// 4. BOOTSTRAP GRID VE CARD YAPISIYLA VİTRİNE DİZME (Kitap Sayfa 148 & 156)
function vitrineDiz(araclar) {
    // jQuery ile kutunun içini boşaltma (empty - Kitap Sayfa 198)
    $("#arac-listesi").empty();

    araclar.forEach(arac => {
        // Satış fiyatını 150'ye bölerek mantıklı bir "Günlük Kira Ücreti" elde ediyoruz
        const gunlukKira = Math.round(arac.price / 150) + 50;

        // Bootstrap col-md-6 col-lg-4 ile her satıra 3 kart diziyoruz
        const kartHTML = `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card bg-black text-light border-secondary h-100 arac-karti">
                    <div class="position-relative">
                        <span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2 fs-6">
                            $${gunlukKira} / Gün
                        </span>
                        <img src="${arac.thumbnail}" class="card-img-top" alt="${arac.title}">
                    </div>
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                            <h5 class="card-title text-warning fw-bold">${arac.title}</h5>
                            <p class="card-text text-secondary small">${arac.description.substring(0, 70)}...</p>
                        </div>
                        <div class="mt-3">
                            <button onclick="modalAc(${arac.id})" class="btn btn-outline-info btn-sm w-100 mb-2">
                                <i class="fa-solid fa-magnifying-glass"></i> Detaylı İncele (Modal)
                            </button>
                            <button onclick="garajaEkle(${arac.id})" class="btn btn-warning btn-sm w-100 fw-bold">
                                <i class="fa-solid fa-plus"></i> Garaja Ekle
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        // jQuery append() ile kartı ekleme (Kitap Sayfa 198)
        $("#arac-listesi").append(kartHTML);
    });
}

// 5. BOOTSTRAP MODAL (AÇILIR PENCERE) DOLDURMA VE AÇMA (Kitap Sayfa 161)
function modalAc(aracId) {
    const secilen = gelenAraclar.find(a => a.id === aracId);
    if (!secilen) return;

    const gunlukKira = Math.round(secilen.price / 150) + 50;

    // jQuery text() ve attr() ile Modal içini dolduruyoruz
    $("#modalBaslik").text(secilen.title);
    $("#modalResim").attr("src", secilen.thumbnail);
    $("#modalAciklama").text(secilen.description);
    $("#modalMarka").text(secilen.brand || "VIP Özel");
    $("#modalPuan").text(secilen.rating);
    $("#modalFiyat").text("$" + gunlukKira);

    // Modal içindeki "Garajıma Ekle" butonuna tıklanınca aracı eklesin
    document.getElementById("modalKiralaBtn").onclick = function() {
        garajaEkle(secilen.id);
        // Bootstrap Modal'ı kapat
        bootstrap.Modal.getInstance(document.getElementById('aracDetayModal')).hide();
    };

    // Bootstrap Modal'ı ekranda göster
    const detayModal = new bootstrap.Modal(document.getElementById('aracDetayModal'));
    detayModal.show();
}

// 6. GARAJA (LOCALSTORAGE) ARAÇ EKLEME
function garajaEkle(aracId) {
    const arac = gelenAraclar.find(a => a.id === aracId);
    if (!arac) return;

    const gunlukKira = Math.round(arac.price / 150) + 50;

    // Araç zaten garajda varsa gün sayısını 1 artır, yoksa yeni ekle
    const mevcutArac = garajListesi.find(item => item.id === aracId);
    if (mevcutArac) {
        mevcutArac.gun += 1;
    } else {
        garajListesi.push({
            id: arac.id,
            baslik: arac.title,
            resim: arac.thumbnail,
            gunlukUcret: gunlukKira,
            gun: 1
        });
    }

    localStorage.setItem("siberGaraj", JSON.stringify(garajListesi));
    sayaciGuncelle();
    alert(`🔑 ${arac.title} garajınıza eklendi!`);
}

function sayaciGuncelle() {
    $("#garajSayaci").text(garajListesi.length);
}


// ==========================================================
// 2. SAYFA: GARAJIM TABLOSU VE JQUERY SİLME EFEKTİ
// ==========================================================
function garajTablosunuCiz() {
    const tablo = document.getElementById("garajTabloGovdesi");
    if (!tablo) return;

    $("#garajTabloGovdesi").empty();
    let toplamTutar = 0;

    if (garajListesi.length === 0) {
        $("#garajTabloGovdesi").html(`<tr><td colspan="6" class="py-4 text-secondary">Garajınızda henüz araç yok. Vitrinden araç seçiniz.</td></tr>`);
        $("#genelToplamText").text("$0");
        return;
    }

    garajListesi.forEach((arac, index) => {
        const araToplam = arac.gunlukUcret * arac.gun;
        toplamTutar += araToplam;

        const satir = `
            <tr id="satir-${index}">
                <td><img src="${arac.resim}" width="70" class="rounded"></td>
                <td class="fw-bold text-warning">${arac.baslik}</td>
                <td>$${arac.gunlukUcret}</td>
                <td>
                    <button onclick="gunDegistir(${index}, -1)" class="btn btn-sm btn-secondary">-</button>
                    <span class="mx-2 fw-bold">${arac.gun} Gün</span>
                    <button onclick="gunDegistir(${index}, 1)" class="btn btn-sm btn-secondary">+</button>
                </td>
                <td class="fw-bold text-info">$${araToplam}</td>
                <td>
                    <button onclick="aracSil(${index})" class="btn btn-sm btn-danger">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        $("#garajTabloGovdesi").append(satir);
    });

    // İndirim varsa uygula ve yazdır
    const indirimliToplam = Math.round(toplamTutar * indirimOrani);
    $("#genelToplamText").text("$" + indirimliToplam);
}

// Gün Sayısını Artırma / Azaltma
function gunDegistir(index, miktar) {
    garajListesi[index].gun += miktar;
    if (garajListesi[index].gun <= 0) {
        aracSil(index); // Gün 0 olursa aracı sil
    } else {
        localStorage.setItem("siberGaraj", JSON.stringify(garajListesi));
        garajTablosunuCiz();
    }
}

// JQUERY FADEOUT İLE ANİMASYONLU SATIR SİLME (Kitap Sayfa 196)
function aracSil(index) {
    // Önce ilgili tablo satırını jQuery fadeOut ile 400ms içinde solarak kaybet!
    $(`#satir-${index}`).fadeOut(400, function() {
        // Animasyon bitince diziden sil ve tabloyu güncelle
        garajListesi.splice(index, 1);
        localStorage.setItem("siberGaraj", JSON.stringify(garajListesi));
        garajTablosunuCiz();
        sayaciGuncelle();
    });
}

function garajiTemizle() {
    garajListesi = [];
    localStorage.removeItem("siberGaraj");
    garajTablosunuCiz();
    sayaciGuncelle();
}

// İndirim Kuponu Kontrolü
function kuponUygula() {
    // jQuery val() ile input değerini okuma (Kitap Sayfa 197)
    const girilenKod = $("#kuponInput").val().trim();

    if (girilenKod === "VIPGARAJ20") {
        indirimOrani = 0.8; // %20 İndirim
        $("#kuponMesaj").html(`<div class="alert alert-success py-1 small">✅ %20 VIP İndirimi Uygulandı!</div>`);
        garajTablosunuCiz();
    } else {
        $("#kuponMesaj").html(`<div class="alert alert-danger py-1 small">❌ Geçersiz Kupon Kodu!</div>`);
    }
}


// ==========================================================
// 3. SAYFA: REZERVASYON VE YAŞ DOĞRULAMA (rezervasyon.html)
// ==========================================================
function rezervasyonTamamla(olay) {
    olay.preventDefault();

    const ad = $("#surucuAd").val();
    const yas = parseInt($("#surucuYas").val());
    const sube = $("#subeSecim").val();

    // BOOTSTRAP ALERT İLE YAŞ KONTROLÜ (Kitap Sayfa 155)
    if (yas < 21) {
        $("#formUyariKutusu")
            .html(`<div class="alert alert-danger"><i class="fa-solid fa-triangle-exclamation"></i> <strong>Hata!</strong> VIP araç kiralamak için yaşınız en az 21 olmalıdır!</div>`)
            .hide()
            .fadeIn(400); // jQuery fadeIn efektiyle uyarıyı göster
        return;
    }

    if (garajListesi.length === 0) {
        $("#formUyariKutusu")
            .html(`<div class="alert alert-warning">Garajınızda hiç araç yok! Önce araç seçmelisiniz.</div>`)
            .hide()
            .fadeIn(400);
        return;
    }

    // Başarılı Durum
    $("#formUyariKutusu")
        .html(`<div class="alert alert-success">🎉 Sayın <strong>${ad}</strong>, rezervasyonunuz onaylandı! Araçlarınız <strong>${sube}</strong> noktasında hazırlanıyor.</div>`)
        .hide()
        .slideDown(400);

    // 3 saniye sonra garajı sıfırla ve ana sayfaya dön
    setTimeout(() => {
        garajiTemizle();
        window.location.href = "index.html";
    }, 3500);
}