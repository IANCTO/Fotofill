// --- 1. Referencias al DOM ---
const canvas = document.getElementById('image-canvas');
const ctx = canvas.getContext('2d');
const logotipo= document.getElementById('logo');
const sliderBrillo = document.getElementById('brightness');
const numBrillo = document.getElementById('brightness-num');
const sliderContraste = document.getElementById('contrast');
const numContraste = document.getElementById('contrast-num');
const sliderSaturacion = document.getElementById('saturation');
const numSaturacion = document.getElementById('saturation-num');

const pantallaCarga = document.getElementById('loading-screen');
// --- 2. Estado de la Aplicación ---
let miImagen = new Image();
let nivelSepia = 0, nivelGrises = 0, nivelInvertido = 0;
let historialDeshacer = [];
let historialRehacer = [];

// --- 3. Inicializar Imagen (Opcional, para tener una por defecto) ---
// miImagen.src = 'tu-gato.jpg'; // Descomenta y pon tu ruta si quieres una imagen inicial

miImagen.onload = () => {
    canvas.width = miImagen.width;
    canvas.height = miImagen.height;
    aplicarFiltros(); // Dibuja la imagen con los filtros actuales
    pantallaCarga.classList.add('hidden');
  };

// --- 4. Motor de Filtros ---
function aplicarFiltros() {
    const brillo = sliderBrillo.value;
    const contraste = sliderContraste.value;
    const saturacion = sliderSaturacion.value;

    ctx.filter = `
        brightness(${brillo}%) 
        contrast(${contraste}%) 
        saturate(${saturacion}%) 
        sepia(${nivelSepia}%) 
        grayscale(${nivelGrises}%) 
        invert(${nivelInvertido}%)
    `;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Solo dibuja si la imagen ya tiene una ruta válida
    if(miImagen.src) {
        ctx.drawImage(miImagen, 0, 0, canvas.width, canvas.height);
    }
}

// --- 5. Historial (Deshacer / Rehacer) ---
function capturarEstado() {
    return {
        brillo: sliderBrillo.value,
        contraste: sliderContraste.value,
        saturacion: sliderSaturacion.value,
        sepia: nivelSepia,
        grises: nivelGrises,
        invertido: nivelInvertido
    };
}

function guardarEnHistorial() {
    historialDeshacer.push(capturarEstado());
    historialRehacer = []; 
}

function cargarEstado(estado) {
    sliderBrillo.value = estado.brillo;
    numBrillo.value = estado.brillo;
    sliderContraste.value = estado.contraste;
    numContraste.value = estado.contraste;
    sliderSaturacion.value = estado.saturacion;
    numSaturacion.value = estado.saturacion;
    
    nivelSepia = estado.sepia;
    nivelGrises = estado.grises;
    nivelInvertido = estado.invertido;
    
    aplicarFiltros();
}

document.getElementById('btn-undo').addEventListener('click', () => {
    if (historialDeshacer.length > 0) {
        historialRehacer.push(capturarEstado());
        cargarEstado(historialDeshacer.pop());
    }
});

document.getElementById('btn-redo').addEventListener('click', () => {
    if (historialRehacer.length > 0) {
        historialDeshacer.push(capturarEstado());
        cargarEstado(historialRehacer.pop());
    }
});

// --- 6. Sincronización de Controles ---
function actualizarFiltro(slider, inputNum) {
    // Al arrastrar (actualiza en vivo)
    slider.addEventListener('input', () => {
        inputNum.value = slider.value;
        aplicarFiltros();
    });

    // Al escribir el número (actualiza en vivo)
    inputNum.addEventListener('input', () => {
        slider.value = inputNum.value;
        aplicarFiltros();
    });

    // Al soltar el clic o terminar de escribir (guarda historial)
    slider.addEventListener('change', guardarEnHistorial);
    inputNum.addEventListener('change', guardarEnHistorial);
}

actualizarFiltro(sliderBrillo, numBrillo);
actualizarFiltro(sliderContraste, numContraste);
actualizarFiltro(sliderSaturacion, numSaturacion);

// --- 7. Botones de Presets ---
const botonesPresets = document.querySelectorAll('.preset-btn');
botonesPresets.forEach(boton => {
    boton.addEventListener('click', () => {
      if (!miImagen.src) {
            alert("¡Por favor, sube una imagen primero antes de aplicar un filtro!");
            return; // Esta palabra clave es crucial: detiene el código aquí y evita que lo de abajo se ejecute.
        }
        guardarEnHistorial(); // Guarda cómo estaba todo antes del preset
        
        const tipoFiltro = boton.getAttribute('data-filter');
        nivelSepia = 0; nivelGrises = 0; nivelInvertido = 0;

        if (tipoFiltro === 'none') {
            sliderBrillo.value = 100; numBrillo.value = 100;
            sliderContraste.value = 100; numContraste.value = 100;
            sliderSaturacion.value = 100; numSaturacion.value = 100;
        } else if (tipoFiltro === 'sepia') { nivelSepia = 100; } 
          else if (tipoFiltro === 'bn') { nivelGrises = 100; } 
          else if (tipoFiltro === 'negative') { nivelInvertido = 100; }

        aplicarFiltros();
    });
});

// --- 8. Subir Imagen Nueva ---
document.getElementById('upload-image').addEventListener('change', (evento) => {
    const archivo = evento.target.files[0];
    if (archivo) {
        pantallaCarga.classList.remove('hidden');
        const urlTemporal = URL.createObjectURL(archivo);
        miImagen.src = urlTemporal;

        // Reiniciar estado
        historialDeshacer = [];
        historialRehacer = [];
        nivelSepia = 0; nivelGrises = 0; nivelInvertido = 0;
        sliderBrillo.value = 100; numBrillo.value = 100;
        sliderContraste.value = 100; numContraste.value = 100;
        sliderSaturacion.value = 100; numSaturacion.value = 100;
    }
});

// --- 9. Exportar Imagen ---
document.getElementById('btn-export').addEventListener('click', () => {
    if(!miImagen.src) {
        alert("¡Sube una imagen primero!");
        return;
    }
    const enlace = document.createElement('a');
    enlace.download = 'foto-editada.png';
    enlace.href = canvas.toDataURL('image/png');
    enlace.click();
});