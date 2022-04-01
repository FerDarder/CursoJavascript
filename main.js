class Usuario{
    constructor(nombre, id, pl, pv){
        this.nombre=nombre;
        this.id=id;
        this.puntos=0;
        this.usuario = true;
        this.pronosticosLocales = pl;
        this.pronosticosVisitantes = pv;
    }
    sumaPuntos(pl,pv,rl,rv){
        if ((pl==rl) && (pv==rv)) this.puntos+= 3;
        else if ((pl<pv) && (rl<rv)) this.puntos+= 1;
        else if ((pl>pv) && (rl>rv)) this.puntos+= 1;
        else if ((pl==pv) && (rl==rv)) this.puntos+= 1;
    }
}


let usuarios = [];
let resultadosLocales = [1, 2, 1, 3, 0, 2, 3, 1];
let resultadosVisitantes = [0, 1, 2, 1, 0, 2, 1, 1];


//Funcion que obtiene los datos del archivo usuarios.json
const obtenerDatosApi = async(mostrar) =>{
    const resultado = await fetch('usuarios.json');
    const respuesta = await resultado.json();
    usuarios = respuesta;
    if (mostrar) completaFormulario();
}


//Funcion para completar el cuestionario
const completaFormulario = () =>{
    let usuario = JSON.parse(localStorage.getItem("usuario"));
    let pLocales = document.querySelectorAll("form div .local");
    let pVisitantes = document.querySelectorAll("form div .visitante");
    for (let i=0;i<pLocales.length;i++){
        pLocales[i].value = usuario.pronosticosLocales[i];
        pLocales[i].disabled = true;
        pVisitantes[i].value = usuario.pronosticosVisitantes[i];
        pVisitantes[i].disabled = true;
    }
    let nom = document.querySelector("form div #name");
    nom.value = usuario.nombre;
    nom.disabled = true;
    let id = document.querySelector("form div #id");
    id.value = usuario.id;
    id.disabled = true;

    usuarios.push(usuario);
    ordenaMuestraTabla();
}


//Funcion que ordena y muestra tabla
const ordenaMuestraTabla = () =>{ 

    // Ordenar la tabla
    usuarios.sort(((a, b) => b.puntos -  a.puntos));


    //Mostrar la tabla
    let tabla = document.createElement("table");
    tabla.id = 'tabla';
    tabla.innerHTML =
    `   <tr class="centrar">
    <th>Nombre</th>
    <th>Id Usuario</th>
    <th>Puntos</th>
        </tr>`;
    document.body.append(tabla);

    for (let usu of usuarios){
        fila = document.createElement("tr");
        fila.innerHTML = 
        usu.usuario == true ?
            `
            <td class="usuario"> <b>${usu.nombre}</b> </td>
            <td class="usuario"> <b>${usu.id}</b> </td>
            <td class="usuario"> <b>${usu.puntos}</b> </td> 
            `
        :
            `
            <td>${usu.nombre}</td>
            <td>${usu.id}</td>
            <td>${usu.puntos}</td> 
            `;
        tabla.append(fila);
    } 

    //Imprimo un salto de linea al final del documento
    document.body.append(document.createElement("div").innerHTML = '<br><br>');
}


//Funcion para encontrar id para el scroll automatico
function findPos(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        do {
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    return [curtop];
    }
}

//Funcion de advertencia en caso de querer enviar pronosticos pero ya están cargados
const pronosticosCompletados = () =>{
    Swal.fire(
        'Error',
        'Ya estan cargados tus resultados',
        'warning'
    );
    window.scroll(0,findPos(document.getElementById("tabla")));
}


//Funcion para validar que todos los campos del formulario estén completados
const validarFormulario = () =>{
    let nom = document.querySelector("form div #name");
    if (nom.value.length==0) return false;
    let id = document.querySelector("form div #id");
    if (id.value.length==0) return false;
    let pLocales = document.querySelectorAll("form div .local");
    let pVisitantes = document.querySelectorAll("form div .visitante");
    for (let i=0;i<pLocales.length;i++){
        if(pLocales[i].value=="") return false;
        if(pVisitantes[i].value=="") return false;
    }
    return true;
}


//Funcion para sumar puntos del usuario, crear una instancia de la clase Usuario, 
//guardarlo en el localStorage, ordenar y mostrar la tabla de posiciones
const sumarPuntos = () =>{
        if (validarFormulario()){ 
            Swal.fire(
                'Buen trabajo!',
                'Completaste tus pronósticos!',
                'success',
            );
            let pLocales = document.querySelectorAll("form div .local");
            let pVisitantes = document.querySelectorAll("form div .visitante");
            let nom = document.querySelector("form div #name");
            nom.disabled = true;
            let id = document.querySelector("form div #id");
            id.disabled = true;
            let pronosticosLocales = [];
            let pronosticosVisitantes = [];
            for (let i=0;i<pLocales.length;i++){
                pronosticosLocales[i] = pLocales[i].value;
                pLocales[i].disabled = true;
                pronosticosVisitantes[i] = pVisitantes[i].value;
                pVisitantes[i].disabled = true;
            }
            nuevoUsuario = new Usuario(nom.value, id.value, pronosticosLocales, pronosticosVisitantes);

            for (let i=0;i<pLocales.length;i++)
                nuevoUsuario.sumaPuntos(pLocales[i].value, pVisitantes[i].value, resultadosLocales[i], resultadosVisitantes[i]);
            usuarios.push(nuevoUsuario);
        
            ordenaMuestraTabla();
                
            //Guardo en el local storage el nuevo usuario
            localStorage.setItem("usuario", JSON.stringify(nuevoUsuario));

            //scroll hacia la tabla
            window.scroll(0,findPos(document.getElementById("tabla")));
        }
        else{
            Swal.fire(
                'Error',
                'Completar todos los campos',
                'error'
            );
        }
}


//Funcion del boton eliminar pronosticos
const eliminarPronosticos = () =>{
    Swal.fire({
        title: '¿Estas seguro que quieres eliminar?',
        text: "No se pueden recuperar!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, eliminar'
    })
    .then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Eliminado!',
                'Tus pronosticos han sido eliminados.',
                'success')
        for (let i=0;i<usuarios.length;i++)
            if (usuarios[i].usuario) usuarios.splice(i,1); 
        localStorage.clear();

        //vaciar los campos del formulario
        let formulario = document.querySelector("form");
        formulario.reset();
        let nom = document.querySelector("form div #name");
        nom.disabled = false;
        let id = document.querySelector("form div #id");
        id.disabled = false;
        let pLocales = document.querySelectorAll("form div .local");
        let pVisitantes = document.querySelectorAll("form div .visitante");
        for (let i=0;i<pLocales.length;i++){
            pLocales[i].disabled = false;
            pVisitantes[i].disabled = false;
        }
        //eliminar la tabla
        tabla = document.querySelector("table");
        document.body.removeChild(tabla);    
        }
    });
}


//En caso de querer apretar eliminar sin haber cargado pronosticos
const errorFaltanPronosticos = () =>{
    Swal.fire(
        'Error',
        'No hay pronosticos a eliminar',
        'error'
    );
}



//Funcion principal del boton enviar
//Si ya está cargado el localStorage, significa que hay un error y lo advierte
//Caso contrario, llama a la funcion sumarPuntos para realizar todo el proceso interno
const funcionEnviar = () =>{
    localStorage.length>0 ? pronosticosCompletados() : sumarPuntos();
}


//Funcion principal del boton eliminar
//Si ya está cargado el localStorage, llama a la funcion eliminarPronosticos para realizar el proceso interno
//Caso contrario no hay pronosticos cargados, hay un error y advierte al usuario
const funcionEliminar = () =>{
    localStorage.length>0 ? eliminarPronosticos() : errorFaltanPronosticos();
}




//Programa principal
enviar = document.querySelector("#enviar");
eliminar = document.querySelector("#eliminar");
if (localStorage.length>0){
    obtenerDatosApi(true);
}
else{
    obtenerDatosApi(false);
}
enviar.addEventListener("click", funcionEnviar);
eliminar.addEventListener("click", funcionEliminar); 










