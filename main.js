function generarMatrizAleatoria(n) {
  const matriz = [];
  for (let i = 0; i < n; i++) {
    const fila = [];
    for (let j = 0; j < n; j++) {
      fila.push(Math.round(Math.random()));
    }
    matriz.push(fila);
  }
  return matriz;
}

function parsearMatrizManual(input, n) {
  const filas = input.trim().split('\n');
  if (filas.length !== n) throw new Error("Número de filas incorrecto");
  return filas.map(fila => {
    const valores = fila.trim().split(" ").map(Number);
    if (valores.length !== n || valores.some(v => v !== 0 && v !== 1))
      throw new Error("Error en los valores de la matriz (deben ser 0 o 1)");
    return valores;
  });
}

function analizarPropiedades(matriz) {
  const n = matriz.length;
  const diagonal = matriz.map((fila, i) => fila[i]);

  const reflexiva = diagonal.every(x => x === 1);
  const irreflexiva = diagonal.every(x => x === 0);
  const simetrica = matriz.every((fila, i) => fila.every((val, j) => val === matriz[j][i]));
  const antisimetrica = matriz.every((fila, i) =>
    fila.every((val, j) => i === j || !(val && matriz[j][i]))
  );
  const asimetrica = matriz.every((fila, i) =>
    fila.every((val, j) => val === 0 || matriz[j][i] === 0)
  );

  const producto = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      matriz[i].some((_, k) => matriz[i][k] && matriz[k][j]) ? 1 : 0
    )
  );
  const transitiva = matriz.every((fila, i) =>
    fila.every((val, j) => !val || producto[i][j])
  );

  return {
    Reflexiva: reflexiva,
    Irreflexiva: irreflexiva,
    Simétrica: simetrica,
    Asimétrica: asimetrica,
    Antisimétrica: antisimetrica,
    Transitiva: transitiva,
    "Orden Parcial": reflexiva && antisimetrica && transitiva,
    "Orden Total": reflexiva && simetrica && transitiva,
    "Orden Estricto": antisimetrica && transitiva && !reflexiva
  };
}

function mostrarRelaciones(matriz) {
  const relaciones = {};
  matriz.forEach((fila, i) => {
    fila.forEach((val, j) => {
      if (val === 1) {
        if (!relaciones[i]) relaciones[i] = [];
        relaciones[i].push(j);
      }
    });
  });
  return relaciones;
}

function dibujarGrafo(matriz) {
  const container = document.getElementById("graph");
  const nodes = matriz.map((_, i) => ({ id: i, label: `Nodo ${i}` }));
  const edges = [];

  matriz.forEach((fila, i) => {
    fila.forEach((val, j) => {
      if (val === 1) {
        edges.push({ from: i, to: j, arrows: "to" });
      }
    });
  });

  const data = {
    nodes: new vis.DataSet(nodes),
    edges: new vis.DataSet(edges)
  };

  const options = {
    layout: {
      improvedLayout: true
    },
    nodes: {
      shape: "ellipse",
      color: "#4a90e2",
      font: { color: "#fff" }
    },
    edges: {
      color: "#aaa"
    },
    physics: {
      enabled: true
    }
  };

  new vis.Network(container, data, options);
}

function procesar() {
  const n = parseInt(document.getElementById("size").value);
  const modo = document.getElementById("mode").value;
  let matriz;

  try {
    if (isNaN(n) || n <= 0) throw new Error("El tamaño de la matriz debe ser un número mayor que 0");

    if (modo === "manual") {
      const input = document.getElementById("manualInput").value;
      matriz = parsearMatrizManual(input, n);
    } else {
      matriz = generarMatrizAleatoria(n);
    }

    const props = analizarPropiedades(matriz);
    const relaciones = mostrarRelaciones(matriz);

    let salida = "Matriz:\n" + matriz.map(f => f.join(" ")).join("\n") + "\n\nRelaciones:\n";
    for (const [nodo, vecinos] of Object.entries(relaciones)) {
      salida += `Nodo ${nodo}: {${vecinos.join(", ")}}\n`;
    }
    salida += "\nPropiedades:\n";
    for (const [k, v] of Object.entries(props)) {
      salida += `${k}: ${v}\n`;
    }

    document.getElementById("output").textContent = salida;
    dibujarGrafo(matriz);
  } catch (err) {
    document.getElementById("output").textContent = "Error: " + err.message;
    document.getElementById("graph").innerHTML = "";
  }
}
