/**
 * TechStore - Çok Markalı, TL Fiyatlı ve Yönlendirmeli Motor
 */

const Platform = {
    sepet: JSON.parse(localStorage.getItem("techstore_sepet")) || [],
    favoriler: JSON.parse(localStorage.getItem("techstore_favoriler")) || [],
    kullanici: JSON.parse(localStorage.getItem("techstore_kullanici")) || null,
    tumUrunler: [],
    filtrelenmisUrunler: [],
    
    aktifKategori: "hepsi",
    aramaMetni: "",
    siralama: "varsayilan",
    
    sayfalama: {
        mevcutSayfa: 1,
        sayfaBasinaUrun: 12
    },

    kargoUcreti: 49.90,
    ucretsizKargoLimiti: 5000.00
};

// ÇOK MARKALI DÜZENLİ KATALOG (Wikimedia Görselleri)
const SabitCokMarkaliKatalog = [
    { id: 101, title: "Apple MacBook Pro 16 M3 Max", category: "laptops", price: 124999.00, discountPercentage: 5, rating: 4.9, stock: 12, thumbnail: "https://upload.wikimedia.org/wikipedia/commons/2/22/MacBook_Pro_16-inch_2019.jpg", description: "16 inç Liquid Retina XDR ekran, 36GB Bellek, 1TB SSD." },
    { id: 102, title: "ASUS ROG Strix G16 Oyuncu Laptop", category: "laptops", price: 68999.00, discountPercentage: 10, rating: 4.8, stock: 15, thumbnail: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Asus_ROG_Laptop.jpg", description: "Intel Core i9, RTX 4070, 32GB RAM, 1TB SSD." },
    { id: 103, title: "MSI Raider GE78 HX Gaming Laptop", category: "laptops", price: 89999.00, discountPercentage: 8, rating: 4.9, stock: 7, thumbnail: "https://upload.wikimedia.org/wikipedia/commons/3/36/MSI_Gaming_Laptop.png", description: "240Hz QHD+ ekran, üst düzey oyun performansı." },
    { id: 104, title: "Lenovo Legion Pro 5 Gen 8", category: "laptops", price: 54999.00, discountPercentage: 12, rating: 4.7, stock: 22, thumbnail: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Lenovo_Legion_Laptop.png", description: "AMD Ryzen 7, RTX 4060, 16GB RAM." },
    { id: 105, title: "HP Victus 15 Dizüstü Bilgisayar", category: "laptops", price: 29999.00, discountPercentage: 15, rating: 4.5, stock: 30, thumbnail: "https://upload.wikimedia.org/wikipedia/commons/8/8c/HP_Laptop.jpg", description: "Fiyat/Performans odaklı oyun ve iş bilgisayarı." },
    { id: 106, title: "Dell XPS 15 OLED Touch Laptop", category: "laptops", price: 74999.00, discountPercentage: 5, rating: 4.8, stock: 10, thumbnail: "https://upload.wikimedia.org/wikipedia/commons/0/03/Dell_XPS_13_9370.jpg", description: "3.5K OLED dokunmatik ekran, i7 işlemci." },
    
    { id: 201, title: "iPhone 15 Pro Max 256GB", category: "smartphones", price: 82999.00, discountPercentage: 5, rating: 4.8, stock: 25, thumbnail: "https://upload.wikimedia.org/wikipedia/commons/c/c2/iPhone_15_Pro_Max.jpg", description: "A17 Pro çip, Titanyum gövde, profesyonel kamera." },
    { id: 202, title: "Samsung Galaxy S24 Ultra", category: "smartphones", price: 73999.00, discountPercentage: 10, rating: 4.9, stock: 18, thumbnail: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Samsung_Galaxy_S24_Ultra.jpg", description: "Galaxy AI özellikleri, S-Pen dahil, 200MP kamera." },
    { id: 203, title: "Google Pixel 8 Pro 128GB", category: "smartphones", price: 34999.00, discountPercentage: 12, rating: 4.7, stock: 20, thumbnail: "https://upload.wikimedia.org/wikipedia/commons/1/18/Google_Pixel_8_Pro.jpg", description: "Saf Android deneyimi ve yapay zeka kameraları." },
    { id: 204, title: "Xiaomi 13 Ultra Leica Camera", category: "smartphones", price: 45999.00, discountPercentage: 15, rating: 4.6, stock: 22, thumbnail: "https://upload.wikimedia.org/wikipedia/commons/3/30/Xiaomi_13_Ultra.jpg", description: "Leica iş birliğiyle geliştirilmiş 1 inç sensörlü dev lens." },
    
    { id: 301, title: "Apple iPad Pro 12.9\" M2 Chip", category: "tablets", price: 42999.00, discountPercentage: 7, rating: 4.9, stock: 14, thumbnail: "https://upload.wikimedia.org/wikipedia/commons/c/c5/IPad_Pro_12.9-inch.jpg", description: "Liquid Retina XDR ekran, Apple Pencil desteği." },
    { id: 302, title: "Samsung Galaxy Tab S9 Ultra", category: "tablets", price: 36999.00, discountPercentage: 10, rating: 4.8, stock: 12, thumbnail: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Samsung_Galaxy_Tab_S8_Ultra.jpg", description: "14.6 inç AMOLED ekran ve S-Pen dahil." },
    
    { id: 401, title: "Sony WH-1000XM5 ANC Kulaklık", category: "mobile-accessories", price: 12999.00, discountPercentage: 10, rating: 4.8, stock: 40, thumbnail: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Sony_WH-1000XM4.jpg", description: "Üstün gürültü engelleme performansı." },
    { id: 402, title: "Logitech G Pro X Superlight 2", category: "mobile-accessories", price: 4999.00, discountPercentage: 5, rating: 4.7, stock: 50, thumbnail: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Logitech_G_Pro_Wireless_Mouse.jpg", description: "Kablosuz 60g ultra hafif profesyonel mouse." }
];

document.addEventListener("DOMContentLoaded", () => {
    appInit();
});

function appInit() {
    sepetSayaciniGuncelle();
    favoriSayaciniGuncelle();
    kullaniciArayuzunuGuncelle();

    if (document.getElementById("urun-vitrini")) {
        Platform.tumUrunler = [...SabitCokMarkaliKatalog];
        filtreleVeListele();
        olayDinleyicileriniKur();
    }

    if (document.getElementById("sepetTabloGovdesi")) {
        sepetTablosunuCiz();
    }
}

function girisYapSayfa(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const ad = email.split('@')[0];

    Platform.kullanici = { ad, email };
    localStorage.setItem("techstore_kullanici", JSON.stringify(Platform.kullanici));

    alert(`Giriş başarılı! Hoş geldiniz Sayın ${ad}.`);
    window.location.href = "index.html";
}

function kayitOlSayfa(e) {
    e.preventDefault();
    const ad = document.getElementById("regAd").value;
    const email = document.getElementById("regEmail").value;

    Platform.kullanici = { ad, email };
    localStorage.setItem("techstore_kullanici", JSON.stringify(Platform.kullanici));

    alert(`Tebrikler ${ad}! Hesabınız başarıyla oluşturuldu.`);
    window.location.href = "index.html";
}

function cikisYap() {
    Platform.kullanici = null;
    localStorage.removeItem("techstore_kullanici");
    kullaniciArayuzunuGuncelle();
    bildirimGoster("Başarıyla çıkış yapıldı.", "bilgi");
}

function kullaniciArayuzunuGuncelle() {
    const alan = document.getElementById("kullaniciAlani");
    if (!alan) return;

    if (Platform.kullanici) {
        alan.innerHTML = `
            <div class="kullanici-kutu">
                <span>👤 ${Platform.kullanici.ad}</span>
                <button onclick="cikisYap()" class="cikis-btn">Çıkış</button>
            </div>
        `;
        const musteriInput = document.getElementById("musteriAd");
        if (musteriInput) musteriInput.value = Platform.kullanici.ad;
    } else {
        alan.innerHTML = `<a href="login.html" class="giris-link-btn">Giriş Yap / Kayıt Ol</a>`;
    }
}

function urunDetayGoster(urunId) {
    const urun = Platform.tumUrunler.find(u => u.id === urunId);
    if (!urun) return;

    const alan = document.getElementById("detayIcerikAlani");
    const indirimliFiyat = (urun.price * (1 - (urun.discountPercentage || 0) / 100)).toFixed(2);

    alan.innerHTML = `
        <div style="flex:1; max-width:300px;">
            <img src="${urun.thumbnail}" style="width:100%; border-radius:8px;">
        </div>
        <div style="flex:1.5; display:flex; flex-direction:column; gap:12px;">
            <span class="kategori-etiket">${urun.category.toUpperCase()}</span>
            <h2>${urun.title}</h2>
            <p style="color:var(--text-muted); font-size:14px;">${urun.description}</p>
            <div style="font-size:14px;"><strong>Puan:</strong> ⭐ ${urun.rating} | <strong>Stok:</strong> ${urun.stock} Adet</div>
            <div class="fiyat-satir" style="margin-top:10px;">
                <span class="fiyat">${indirimliFiyat} TL</span>
                ${urun.discountPercentage ? `<span class="eski-fiyat">${urun.price.toFixed(2)} TL</span>` : ''}
            </div>
            <button onclick="sepeteEkle(${urun.id}); modalKapat('detayModal');" class="satin-al-btn" style="margin-top:15px;">🛒 Sepete Ekle</button>
        </div>
    `;
    modalAc("detayModal");
}

function modalAc(id) { const el = document.getElementById(id); if (el) el.style.display = "flex"; }
function modalKapat(id) { const el = document.getElementById(id); if (el) el.style.display = "none"; }

function filtreleVeListele() {
    let sonuclar = [...Platform.tumUrunler];

    if (Platform.aktifKategori !== "hepsi") {
        sonuclar = sonuclar.filter(u => u.category === Platform.aktifKategori);
    }

    if (Platform.aramaMetni) {
        sonuclar = sonuclar.filter(u => 
            u.title.toLowerCase().includes(Platform.aramaMetni) || 
            (u.description && u.description.toLowerCase().includes(Platform.aramaMetni))
        );
    }

    if (Platform.siralama === "fiyat-artan") {
        sonuclar.sort((a, b) => a.price - b.price);
    } else if (Platform.siralama === "fiyat-azalan") {
        sonuclar.sort((a, b) => b.price - a.price);
    } else if (Platform.siralama === "puan-azalan") {
        sonuclar.sort((a, b) => b.rating - a.rating);
    }

    Platform.filtrelenmisUrunler = sonuclar;
    Platform.sayfalama.mevcutSayfa = 1;
    vitrineRenderEt();
}

function vitrineRenderEt() {
    const vitrin = document.getElementById("urun-vitrini");
    if (!vitrin) return;

    vitrin.innerHTML = "";

    const { mevcutSayfa, sayfaBasinaUrun } = Platform.sayfalama;
    const urunler = Platform.filtrelenmisUrunler;

    if (urunler.length === 0) {
        vitrin.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:50px;">🔍 Aradığınız kriterlere uygun ürün bulunamadı.</div>`;
        return;
    }

    const baslangic = (mevcutSayfa - 1) * sayfaBasinaUrun;
    const bitis = baslangic + sayfaBasinaUrun;
    const sayfadakiUrunler = urunler.slice(baslangic, bitis);

    const fragment = document.createDocumentFragment();

    sayfadakiUrunler.forEach(urun => {
        const indirimliFiyat = (urun.price * (1 - (urun.discountPercentage || 0) / 100)).toFixed(2);
        const favorideMi = Platform.favoriler.includes(urun.id);

        const kart = document.createElement("article");
        kart.className = "urun-karti";
        kart.innerHTML = `
            <div class="gorsel-kutu" onclick="urunDetayGoster(${urun.id})">
                <img src="${urun.thumbnail}" alt="${kacir(urun.title)}" loading="lazy">
                ${urun.discountPercentage ? `<span class="indirim-rozet">-%${Math.round(urun.discountPercentage)}</span>` : ''}
                <button onclick="event.stopPropagation(); favoriToggle(${urun.id})" class="favori-btn">${favorideMi ? '❤️' : '🤍'}</button>
            </div>
            <div class="urun-icerik">
                <span class="kategori-etiket">${urun.category.toUpperCase()}</span>
                <h3 onclick="urunDetayGoster(${urun.id})">${urun.title}</h3>
                <p class="aciklama">${urun.description ? urun.description.substring(0, 55) + '...' : ''}</p>
                <div class="puan-stok">
                    <span>⭐ ${urun.rating}</span>
                    <span>Stok: ${urun.stock}</span>
                </div>
                <div class="fiyat-satir">
                    <span class="fiyat">${indirimliFiyat} TL</span>
                    ${urun.discountPercentage ? `<span class="eski-fiyat">${urun.price.toFixed(2)} TL</span>` : ''}
                </div>
                <button onclick="sepeteEkle(${urun.id})" class="ekle-btn">🛒 Sepete Ekle</button>
            </div>
        `;
        fragment.appendChild(kart);
    });

    vitrin.appendChild(fragment);
}

function sepeteEkle(urunId) {
    const urun = Platform.tumUrunler.find(u => u.id === urunId);
    if (!urun) return;

    const indirimliFiyat = Number((urun.price * (1 - (urun.discountPercentage || 0) / 100)).toFixed(2));
    const sepetteki = Platform.sepet.find(s => s.id === urunId);

    if (sepetteki) {
        sepetteki.adet += 1;
        bildirimGoster(`"${urun.title}" miktarı arttırıldı.`, "bilgi");
    } else {
        Platform.sepet.push({
            id: urun.id,
            title: urun.title,
            price: indirimliFiyat,
            thumbnail: urun.thumbnail,
            stock: urun.stock,
            adet: 1
        });
        bildirimGoster(`"${urun.title}" sepete eklendi!`, "basari");
    }

    sepetiKaydet();
    sepetSayaciniGuncelle();
    sesCal();
}

function favoriToggle(urunId) {
    const index = Platform.favoriler.indexOf(urunId);
    if (index > -1) {
        Platform.favoriler.splice(index, 1);
        bildirimGoster("Favorilerden çıkarıldı.", "bilgi");
    } else {
        Platform.favoriler.push(urunId);
        bildirimGoster("Favorilere eklendi! ❤️", "basari");
    }
    localStorage.setItem("techstore_favoriler", JSON.stringify(Platform.favoriler));
    favoriSayaciniGuncelle();
    vitrineRenderEt();
}

function olayDinleyicileriniKur() {
    document.querySelectorAll(".kat-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".kat-btn").forEach(b => b.classList.remove("aktif"));
            e.target.classList.add("aktif");
            Platform.aktifKategori = e.target.getAttribute("data-kategori") || "hepsi";
            filtreleVeListele();
        });
    });

    const aramaInput = document.getElementById("aramaInput");
    if (aramaInput) {
        aramaInput.addEventListener("input", debounce((e) => {
            Platform.aramaMetni = e.target.value.toLowerCase().trim();
            filtreleVeListele();
        }, 250));
    }

    const siralamaSelect = document.getElementById("siralamaSelect");
    if (siralamaSelect) {
        siralamaSelect.addEventListener("change", (e) => {
            Platform.siralama = e.target.value;
            filtreleVeListele();
        });
    }
}

function sepetTablosunuCiz() {
    const govde = document.getElementById("sepetTabloGovdesi");
    const araToplamEl = document.getElementById("araToplamAlani");
    const kargoEl = document.getElementById("kargoTutarAlani");
    const genelToplamEl = document.getElementById("toplamTutarAlani");

    if (!govde) return;

    govde.innerHTML = "";
    let araToplam = 0;

    if (Platform.sepet.length === 0) {
        govde.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:#6b7280;">🛒 Sepetiniz boş.</td></tr>`;
        if (araToplamEl) araToplamEl.innerText = "0.00 TL";
        if (kargoEl) kargoEl.innerText = "0.00 TL";
        if (genelToplamEl) genelToplamEl.innerText = "0.00 TL";
        return;
    }

    const fragment = document.createDocumentFragment();

    Platform.sepet.forEach(item => {
        const tutar = item.price * item.adet;
        araToplam += tutar;

        const satir = document.createElement("tr");
        satir.innerHTML = `
            <td><img src="${item.thumbnail}" style="width:50px; height:50px; object-fit:contain; border-radius:6px;"></td>
            <td style="font-weight:600;">${item.title}</td>
            <td>${item.price.toFixed(2)} TL</td>
            <td>
                <div style="display:flex; align-items:center; gap:6px;">
                    <button onclick="sepetAdetGuncelle(${item.id}, -1)" class="adet-btn">-</button>
                    <span style="font-weight:bold;">${item.adet}</span>
                    <button onclick="sepetAdetGuncelle(${item.id}, 1)" class="adet-btn">+</button>
                </div>
            </td>
            <td style="font-weight:bold; color:#10b981;">${tutar.toFixed(2)} TL</td>
            <td><button onclick="sepettenSil(${item.id})" class="urun-sil-btn">✖</button></td>
        `;
        fragment.appendChild(satir);
    });

    govde.appendChild(fragment);

    const kargo = araToplam >= Platform.ucretsizKargoLimiti ? 0 : Platform.kargoUcreti;
    const toplam = araToplam + kargo;

    if (araToplamEl) araToplamEl.innerText = araToplam.toFixed(2) + " TL";
    if (kargoEl) kargoEl.innerText = kargo === 0 ? "ÜCRETSİZ" : kargo.toFixed(2) + " TL";
    if (genelToplamEl) genelToplamEl.innerText = toplam.toFixed(2) + " TL";
}

function sepetAdetGuncelle(id, degisim) {
    const item = Platform.sepet.find(s => s.id === id);
    if (!item) return;

    item.adet += degisim;
    if (item.adet <= 0) {
        sepettenSil(id);
        return;
    }

    sepetiKaydet();
    sepetTablosunuCiz();
    sepetSayaciniGuncelle();
}

function sepettenSil(id) {
    Platform.sepet = Platform.sepet.filter(s => s.id !== id);
    sepetiKaydet();
    sepetTablosunuCiz();
    sepetSayaciniGuncelle();
    bildirimGoster("Ürün çıkarıldı.", "bilgi");
}

function sepetiBosalt() {
    Platform.sepet = [];
    sepetiKaydet();
    sepetTablosunuCiz();
    sepetSayaciniGuncelle();
    bildirimGoster("Sepet temizlendi.", "bilgi");
}

function siparisiTamamla(olay) {
    olay.preventDefault();
    if (Platform.sepet.length === 0) {
        bildirimGoster("Sepetiniz boş!", "hata");
        return;
    }

    const musteri = document.getElementById("musteriAd")?.value || "Müşteri";
    bildirimGoster(`🎉 Siparişiniz Alındı Sayın ${musteri}!`, "basari");

    sepetiBosalt();
    setTimeout(() => { window.location.href = "index.html"; }, 2000);
}

function sepetiKaydet() {
    localStorage.setItem("techstore_sepet", JSON.stringify(Platform.sepet));
}

function sepetSayaciniGuncelle() {
    const el = document.getElementById("sepetSayaci");
    if (el) el.innerText = Platform.sepet.reduce((t, i) => t + i.adet, 0);
}

function favoriSayaciniGuncelle() {
    const el = document.getElementById("favoriSayaci");
    if (el) el.innerText = Platform.favoriler.length;
}

function sesCal() {
    const ses = document.getElementById("sepetSesi");
    if (ses) { ses.currentTime = 0; ses.play().catch(() => {}); }
}

function bildirimGoster(mesaj, tip = "bilgi") {
    let kutu = document.getElementById("toast-alani");
    if (!kutu) {
        kutu = document.createElement("div");
        kutu.id = "toast-alani";
        kutu.style.cssText = "position:fixed; bottom:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:8px;";
        document.body.appendChild(kutu);
    }

    const toast = document.createElement("div");
    const renk = tip === "basari" ? "#10b981" : tip === "hata" ? "#ef4444" : "#3b82f6";
    toast.style.cssText = `background:${renk}; color:#fff; padding:12px 18px; border-radius:8px; font-weight:500; font-size:14px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); opacity:0; transition:all 0.3s ease;`;
    toast.innerText = mesaj;

    kutu.appendChild(toast);
    setTimeout(() => toast.style.opacity = "1", 10);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function debounce(fn, ms = 300) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
}

function kacir(str) {
    return (str || '').replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}