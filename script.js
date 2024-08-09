// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDtwPpezdUHupb9I5K1LIWpSzzjczPk02s",
    authDomain: "rifa-5e4d3.firebaseapp.com",
    projectId: "rifa-5e4d3",
    storageBucket: "rifa-5e4d3.appspot.com",
    messagingSenderId: "967228446616",
    appId: "1:967228446616:web:c800ec297ed63b48383ded"
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Generar cuadrícula de números
const numerosGrid = document.querySelector("#numeros-grid .row-cols-10");

for (let i = 0; i < 100; i++) {
    const numeroDiv = document.createElement("div");
    numeroDiv.classList.add("col");
    numeroDiv.innerHTML = `<button class="btn btn-secondary w-100">${i.toString().padStart(2, '0')}</button>`;
    numerosGrid.appendChild(numeroDiv);
}

// Función para mostrar información del participante
function mostrarInformacion(doc) {
    document.getElementById("info-nombre").querySelector("span").textContent = doc.data().nombre || "No registrado";
    document.getElementById("info-apellido").querySelector("span").textContent = doc.data().apellido || "No registrado";
    document.getElementById("info-numero").querySelector("span").textContent = doc.id;
    document.getElementById("info-pago").querySelector("span").textContent = doc.data().pago ? "Sí" : "No";
}

// Función para mostrar información del participante
function borrarInformacion() {
        // Limpiar la información mostrada en el recuadro
    document.getElementById("info-nombre").querySelector("span").textContent = "";
    document.getElementById("info-apellido").querySelector("span").textContent = "";
    document.getElementById("info-numero").querySelector("span").textContent = "";
    document.getElementById("info-pago").querySelector("span").textContent = "";

}

// Manejar clic en los botones de la cuadrícula
let isUpdating = false;
function manejarClicNumero(doc) {
    document.getElementById("numero").value = doc.id;
    document.getElementById("nombre").value = doc.data().nombre || '';
    document.getElementById("apellido").value = doc.data().apellido || '';
    document.getElementById("pago").checked = doc.data().pago || false;
    
    isUpdating=true;
    // Mostrar los botones de actualizar y eliminar, ocultar el de agregar
    document.getElementById("agregar-btn").style.display = "none";
    document.getElementById("actualizar-btn").style.display = "inline";
    document.getElementById("eliminar-btn").style.display = "inline";
}

// Función para ocultar los botones de actualizar y eliminar, y mostrar el de agregar
function resetForm() {
    isUpdating = false;
    borrarInformacion()
    document.getElementById("registro-form").reset();
    document.getElementById("agregar-btn").style.display = "inline";
    document.getElementById("actualizar-btn").style.display = "none";
    document.getElementById("eliminar-btn").style.display = "none";
}

// Agregar o actualizar participante
document.getElementById("registro-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const numero = document.getElementById("numero").value;
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const pago = document.getElementById("pago").checked;

    if (isUpdating) { // si estamos actualizando
        setDoc(doc(db, "rifa", numero), {
            nombre: nombre,
            apellido: apellido,
            pago: pago
        }, { merge: true })
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Participante actualizado!',
                text: `El participante con número ${numero} ha sido actualizado exitosamente.`,
                showConfirmButton: false,
                timer: 2000
            });

            // Cambiar color del botón correspondiente al número
            const numeroBtn = Array.from(numerosGrid.getElementsByTagName("button")).find(btn => btn.textContent === numero);
            if (numeroBtn) {
                numeroBtn.classList.remove("btn-secondary", "btn-warning", "btn-success");
                numeroBtn.classList.add(pago ? "btn-success" : "btn-warning");
            }

            resetForm();
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al actualizar el participante.',
            });
            console.error("Error al actualizar participante: ", error);
        });
    } else { // si estamos agregando un nuevo participante
        setDoc(doc(db, "rifa", numero), {
            nombre: nombre,
            apellido: apellido,
            pago: pago
        })
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Participante registrado!',
                text: `El participante con número ${numero} ha sido registrado exitosamente.`,
                showConfirmButton: false,
                timer: 2000
            });

            resetForm();
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al registrar el participante.',
            });
            console.error("Error al registrar participante: ", error);
        });
    }
});

// Eliminar participante
document.getElementById("eliminar-btn").addEventListener("click", function() {
    const numero = document.getElementById("numero").value;

    // Eliminar el documento correspondiente
    deleteDoc(doc(db, "rifa", numero))
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Participante eliminado!',
                text: `El participante con número ${numero} ha sido eliminado exitosamente.`,
                showConfirmButton: false,
                timer: 2000
            });

            resetForm();
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al eliminar el participante.',
            });
            console.error("Error al eliminar participante: ", error);
        });
});


// Escuchar cambios en la colección "rifa"
onSnapshot(collection(db, "rifa"), snapshot => {
    snapshot.forEach(doc => {
        const numero = doc.id;
        const numeroBtn = Array.from(numerosGrid.getElementsByTagName("button")).find(btn => btn.textContent === numero);
        if (numeroBtn) {
            numeroBtn.classList.remove("btn-secondary");
            numeroBtn.classList.add(doc.data().pago ? "btn-success" : "btn-warning");
            numeroBtn.disabled = false;

            // Agregar evento para mostrar la información al hacer clic
            numeroBtn.addEventListener("click", () => {
                manejarClicNumero(doc);
                mostrarInformacion(doc);
            });
        }
    });
});
