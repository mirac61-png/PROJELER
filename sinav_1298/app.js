let tepsi = JSON.parse(localStorage.getItem("kampusTepsi")) || [];
let vitrinYemekleri = [];
let indirim = 1;

$(document).ready(function() {
    // GÖREV 7: Yanlış ID #yanlisKutuId yerine doğru ID #gizliKuponKutusu yazıldı
    $("#duyuruBtn").click(function() {
        $("#gizliKuponKutusu").slideToggle(400);
    });

    sayacGuncelle();
    yemekleriGetir();
    tabloyuCiz();
});

async function yemekleriGetir() {
    const liste = document.getElementById("yemek-listesi");
    if (!liste) return;

    // GÖREV 4: Okul No son rakamı 2 alındığında 2+6 = 8 yapıldı (limit=8)
    const cevap = await fetch("https://dummyjson.com/recipes?limit=8");
    const veri = await cevap.json();
    vitrinYemekleri = veri.recipes;
    vitrineBas(vitrinYemekleri);
}

function vitrineBas(yemekler) {
    $("#yemek-listesi").empty();

    yemekler.forEach(yemek => {
        // GÖREV 5: Kalorinin 4'e bölümünün yuvarlanmış hali
        const fiyat = Math.round(yemek.caloriesPerServing / 4);

        // GÖREV 6: Kalori 400'den büyükse bg-danger, değilse bg-success
        let rozetRenk = "";
        if (yemek.caloriesPerServing > 400) {
            rozetRenk = "bg-danger";
        } else {
            rozetRenk = "bg-success";
        }

        // GÖREV 2: Geniş ekranda yan yana 3'lü dizilim için col-lg-4 eklendi
        const kart = `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card bg-black text-light border-secondary h-100 yemek-karti">
                    <div class="position-relative">
                        <span class="badge ${rozetRenk} position-absolute top-0 end-0 m-2">
                            ${yemek.caloriesPerServing} kcal
                        </span>
                        <img src="${yemek.image}" class="card-img-top" alt="${yemek.name}">
                    </div>
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                            <h5 class="card-title text-success fw-bold">${yemek.name}</h5>
                            <p class="text-secondary small">⏱️ Hazırlanma: ${yemek.prepTimeMinutes} dk | ⭐ ${yemek.rating}</p>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <span class="fs-4 fw-bold text-warning">${fiyat} TL</span>
                            <button onclick="tepsiyeEkle(${yemek.id})" class="btn btn-success btn-sm fw-bold">
                                <i class="fa-solid fa-plus"></i> Ekle
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $("#yemek-listesi").append(kart);
    });
}

function tepsiyeEkle(id) {
    const secilen = vitrinYemekleri.find(y => y.id === id);
    if (!secilen) return;

    const hesaplananFiyat = Math.round(secilen.caloriesPerServing / 4);

    tepsi.push({
        ad: secilen.name,
        resim: secilen.image,
        kalori: secilen.caloriesPerServing,
        sure: secilen.prepTimeMinutes,
        fiyat: hesaplananFiyat
    });

    localStorage.setItem("kampusTepsi", JSON.stringify(tepsi));
    sayacGuncelle();
}

function sayacGuncelle() {
    $("#tepsiSayaci").text(tepsi.length);
}

function tabloyuCiz() {
    const govde = document.getElementById("tepsiTabloGovdesi");
    if (!govde) return;

    $("#tepsiTabloGovdesi").empty();
    let topKalori = 0;
    let topFiyat = 0;

    tepsi.forEach((urun, index) => {
        topKalori += urun.kalori;
        topFiyat += urun.fiyat;

        // GÖREV 8.B: Hazırlanma süresini gösteren <td> hücresi eklendi
        const satir = `
            <tr>
                <td><img src="${urun.resim}" width="60" class="rounded"></td>
                <td class="fw-bold">${urun.ad}</td>
                <td>${urun.kalori} kcal</td>
                <td>${urun.sure} dk</td>
                <td class="text-warning fw-bold">${urun.fiyat} TL</td>
                <td><button onclick="urunSil(${index})" class="btn btn-sm btn-danger"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
        $("#tepsiTabloGovdesi").append(satir);
    });

    $("#toplamKalori").text(topKalori + " kcal");
    $("#toplamFiyat").text(Math.round(topFiyat * indirim) + " TL");
}

function urunSil(index) {
    tepsi.splice(index, 1);
    localStorage.setItem("kampusTepsi", JSON.stringify(tepsi));
    tabloyuCiz();
    sayacGuncelle();
}

function indirimYap() {
    const girilen = $("#kuponInput").val().trim();
    // GÖREV 10: Kendi adınız büyük harflerle (AHMET) yazıldı ve %25 indirim tanımlandı
    if (girilen === "AHMET") {
        indirim = 0.75;
        $("#indirimMesaj").html(`<div class="alert alert-success py-1 small">✅ %25 Öğrenci İndirimi Uygulandı!</div>`);
        tabloyuCiz();
    } else {
        $("#indirimMesaj").html(`<div class="alert alert-danger py-1 small">❌ Geçersiz Kod!</div>`);
    }
}

function siparisVer(e) {
    e.preventDefault();
    if (tepsi.length === 0) {
        alert("Tepsiniz boş!");
        return;
    }
    alert("Siparişiniz onaylandı! Afiyet olsun.");
    localStorage.removeItem("kampusTepsi");
    window.location.href = "index.html";
}