const URL_PRODUK = "https://dummyjson.com/products";

const tbody = document.getElementById("isi-tabel");
const infoKatalog = document.getElementById("info-katalog");
const kotakCari = document.getElementById("cari");
const pilihUrut = document.getElementById("urut");

let semuaProduk = []; // disimpan agar bisa dicari & diurutkan tanpa fetch ulang

function muatProduk() {
    tbody.replaceChildren();
    infoKatalog.className = "info";
    infoKatalog.innerHTML = '<div class="loading-bar"></div>Mengambil data produk...';

    fetch(URL_PRODUK)
        .then(function (res) {
            if (!res.ok) throw new Error("Server menjawab dengan kode " + res.status);
            return res.json();
        })
        .then(function (json) {
            semuaProduk = json.products;
            render();
        })
        .catch(function (err) {
            infoKatalog.className = "info error";
            infoKatalog.textContent = "Gagal memuat produk (" + err.message + "). ";
            const ulang = document.createElement("button");
            ulang.type = "button";
            ulang.textContent = "Muat ulang";
            ulang.addEventListener("click", muatProduk);
            infoKatalog.appendChild(ulang);
        });
}

function render() {
    const kata = kotakCari.value.trim().toLowerCase();
    let hasil = semuaProduk.filter(function (p) {
        return p.title.toLowerCase().includes(kata);
    });

    const mode = pilihUrut.value;
    if (mode === "nama") hasil.sort((a, b) => a.title.localeCompare(b.title));
    if (mode === "murah") hasil.sort((a, b) => a.price - b.price);
    if (mode === "mahal") hasil.sort((a, b) => b.price - a.price);

    tbody.replaceChildren();
    hasil.forEach(function (p) {
        const tr = document.createElement("tr");
        const kolom = [p.title, p.category, "$" + p.price.toFixed(2)];
        kolom.forEach(function (isi, i) {
            const td = document.createElement("td");
            td.textContent = isi;
            if (i === 2) td.className = "kanan";
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    infoKatalog.className = "info";
    infoKatalog.textContent = hasil.length
        ? "Menampilkan " + hasil.length + " dari " + semuaProduk.length + " produk."
        : "Tidak ada produk bernama \"" + kotakCari.value + "\".";
}

kotakCari.addEventListener("input", render);
pilihUrut.addEventListener("change", render);

muatProduk();