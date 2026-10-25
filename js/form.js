const tabs = document.querySelectorAll(".tab");
tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
        tabs.forEach((t) => t.classList.toggle("aktif", t === tab));
        document.querySelectorAll(".panel").forEach(function (panel) {
            panel.hidden = panel.id !== tab.dataset.target;
        });
    });
});


const form = document.getElementById("form-bagi");
const fAcara = document.getElementById("acara");
const fTotal = document.getElementById("total");
const fOrang = document.getElementById("orang");
const fTip = document.getElementById("tip");
const fBulat = document.getElementById("bulat");
const labelTip = document.getElementById("nilai-tip");
const outPerOrang = document.getElementById("per-orang");
const outRincian = document.getElementById("rincian");
const daftarRiwayat = document.getElementById("riwayat");

const rupiah = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n);


function tampilError(input, pesan) {
    document.getElementById("salah-" + input.id).textContent = pesan;
    input.classList.toggle("salah-input", pesan !== "");
    return pesan === "";
}

function cekAcara() {
    const v = fAcara.value.trim();
    return tampilError(fAcara, v.length < 3 ? "Nama acara minimal 3 huruf." : "");
}
function cekTotal() {
    const v = Number(fTotal.value);
    let pesan = "";
    if (fTotal.value === "") pesan = "Total tagihan wajib diisi.";
    else if (v <= 0) pesan = "Total harus lebih dari 0.";
    return tampilError(fTotal, pesan);
}
function cekOrang() {
    const v = Number(fOrang.value);
    let pesan = "";
    if (fOrang.value === "") pesan = "Jumlah orang wajib diisi.";
    else if (!Number.isInteger(v) || v < 1 || v > 50) pesan = "Isi bilangan bulat 1 sampai 50.";
    return tampilError(fOrang, pesan);
}


function hitung() {
    const total = Number(fTotal.value);
    const orang = Number(fOrang.value);
    const tip = Number(fTip.value);
    if (!(total > 0) || !(orang >= 1)) return null;

    const totalAkhir = total + (total * tip) / 100;
    let perOrang = totalAkhir / orang;
    perOrang = fBulat.checked ? Math.ceil(perOrang / 500) * 500 : Math.round(perOrang);
    return { total, orang, tip, totalAkhir, perOrang };
}

function perbaruiHasil() {
    labelTip.textContent = fTip.value;
    const h = hitung();
    if (!h) {
        outPerOrang.textContent = "Rp 0";
        outRincian.textContent = "Isi total tagihan untuk mulai menghitung.";
        return;
    }
    outPerOrang.textContent = rupiah(h.perOrang);
    outRincian.textContent =
        rupiah(h.total) + " + tip " + h.tip + "% = " + rupiah(Math.round(h.totalAkhir)) + ", dibagi " + h.orang + " orang";
}


[fTotal, fOrang, fTip].forEach((el) => el.addEventListener("input", perbaruiHasil));
fBulat.addEventListener("change", perbaruiHasil);
fAcara.addEventListener("blur", cekAcara);
fTotal.addEventListener("blur", cekTotal);
fOrang.addEventListener("blur", cekOrang);
fAcara.addEventListener("input", () => fAcara.classList.contains("salah-input") && cekAcara());
fTotal.addEventListener("input", () => fTotal.classList.contains("salah-input") && cekTotal());
fOrang.addEventListener("input", () => fOrang.classList.contains("salah-input") && cekOrang());


form.addEventListener("submit", function (e) {
    e.preventDefault();
    const valid = [cekAcara(), cekTotal(), cekOrang()].every(Boolean);
    if (!valid) {
        form.querySelector(".salah-input").focus();
        return;
    }
    tambahRiwayat(fAcara.value.trim(), hitung());
    fAcara.value = "";
    fAcara.focus();
});

function tambahRiwayat(nama, h) {
    const kosong = daftarRiwayat.querySelector(".kosong");
    if (kosong) kosong.remove();

    const li = document.createElement("li");
    const detail = document.createElement("div");
    detail.className = "detail";
    const judul = document.createElement("strong");
    judul.textContent = nama;
    const sub = document.createElement("small");
    sub.textContent = h.orang + " orang · tiap orang " + rupiah(h.perOrang);
    detail.append(judul, sub);

    const hapus = document.createElement("button");
    hapus.type = "button";
    hapus.textContent = "Hapus";
    hapus.dataset.aksi = "hapus";

    li.append(detail, hapus);
    daftarRiwayat.prepend(li);
}


daftarRiwayat.addEventListener("click", function (e) {
    if (e.target.dataset.aksi !== "hapus") return;
    e.target.closest("li").remove();
    if (!daftarRiwayat.children.length) {
        daftarRiwayat.innerHTML = '<li class="kosong">Belum ada yang disimpan.</li>';
    }
});


document.getElementById("btn-kosong").addEventListener("click", function () {
    form.reset();
    [fAcara, fTotal, fOrang].forEach((el) => tampilError(el, ""));
    perbaruiHasil();
});

perbaruiHasil();