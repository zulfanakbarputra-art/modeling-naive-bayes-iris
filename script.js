const formPrediksi = document.getElementById("form-prediksi")
const inputFitur = document.querySelectorAll("#form-prediksi input")
const infoModel = document.getElementById("info-model")
const teksSpesies = document.getElementById("hasil-spesies")
const teksKeterangan = document.getElementById("hasil-keterangan")

let dataModel
let classes, jumlah_train, jumlah_test, gaussianData, multinomialData, bernoulliData

async function muatModel() {
    try {
        const respon = await fetch("model_nb.json", { cache: "no-store" })
        if (!respon.ok) throw new Error(`HTTP Error: ${respon.status}`)

        dataModel = await respon.json()
        classes = dataModel.classes
        jumlah_train = dataModel.jumlah_train
        jumlah_test = dataModel.jumlah_test
        gaussianData = dataModel.gaussian

        tampilkanInfoModel()
    } catch (error) {
        teksKeterangan.textContent = "File model_nb.json gagal dimuat"
        teksKeterangan.classList.add("error")
        console.error(error)
    }
}

muatModel()

const tampilkanInfoModel = () => {
    const jumlahData = jumlah_train + jumlah_test
    const persenTest = Math.round((jumlah_test / jumlahData) * 100)
    const persenTrain = 100 - persenTest
    infoModel.textContent = `Train : Test = ${persenTrain}% : ${persenTest}% (Gaussian)`
}

// 1. Prediksi Gaussian NB
const prediksiGaussian = (fitur) => {
    let maxLogProb = -Infinity
    let terpilih = classes[0]

    for (let i = 0; i < classes.length; i++) {
        let logProb = Math.log(gaussianData.class_prior[i])
        for (let j = 0; j < fitur.length; j++) {
            const mean = gaussianData.theta[i][j]
            const variance = gaussianData.var[i][j]
            const p = (1 / Math.sqrt(2 * Math.PI * variance)) * Math.exp(-((fitur[j] - mean) ** 2) / (2 * variance))
            logProb += Math.log(p > 0 ? p : 1e-9)
        }
        if (logProb > maxLogProb) {
            maxLogProb = logProb
            terpilih = classes[i]
        }
    }
    return terpilih
}

const singkatNama = (spesies) => spesies.replace("Iris-", "")

formPrediksi.addEventListener("submit", (e) => {
    e.preventDefault()

    if (!dataModel) {
        alert("Model belum dimuat.")
        return
    }

    const fitur = []
    for (const input of inputFitur) {
        fitur.push(parseFloat(input.value))
    }

    const hasilG = prediksiGaussian(fitur)

    teksSpesies.textContent = "Hasil Prediksi Model:"
    teksKeterangan.textContent = `GaussianNB: ${singkatNama(hasilG)}`; 
})