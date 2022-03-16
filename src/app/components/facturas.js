const myModal = new bootstrap.Modal(document.getElementById('myModal'), {
    keyboard: false
});

let listFacturas = [];
let listDetalles = [];
let flagModificarFactura = false

const arrTipoPago = [
    { id: 'Contado', name: 'Contado' },
    { id: 'Crédito', name: 'Crédito' },
]

window.addEventListener("load", async () => {
    await loadTableFactura();
});

const loadTableFactura = async () => {
    const divGeneral = document.querySelector('#divGeneral');

    const headerFactura = `
    <tr>
        <th class="text-center" scope="col">Fecha</th>
        <th class="text-center" scope="col">Número Factura</th>
        <th class="text-center" scope="col">Nombre Cliente</th>
        <th class="text-center" scope="col">Total</th>
        <th class="text-center" scope="col">Funciones</th>
    </tr>`;

    const noFacturas = `<tr><td colspan="5" align="center"><span class="fw-bolder">No existen resultados en esta tabla</span></td></tr>`

    const cargandoFacturas = `<tr><td colspan="5" align="center"><span class="fw-bolder">Cargando...</span></td></tr>`

    divGeneral.innerHTML = `
        <table class="table table-sm table-hover table-bordered">
            <thead>${headerFactura}</thead>
            <tbody>${cargandoFacturas}</tbody>
        </table>`;

    listFacturas = await axiosGET(urlFactura);

    if (!emptyObject(listFacturas)) {
        let queryRows = ``;
        listFacturas.forEach(item => {
            queryRows += `
            <tr>
                <td class="text-center">${item.fecha.split('T')[0]}</td>
                <td>${item.numero}</td>
                <td>${item.nombre}</td>
                <td class="text-center">${item.total.toFixed(2)}</td>
                <td class="text-center" style="width: 15%">
                    <button class="btn btn-sm btn-primary" type="button" onClick="updateFactura('${item.id}')">Modificar</button>
                    <button class="btn btn-sm btn-danger" type="button" onClick="deleteFactura('${item.id}')">Eliminar</button>
                </td>
            </tr>`
        });

        divGeneral.innerHTML = `
        <table class="table table-sm table-hover table-bordered">
            <thead>${headerFactura}</thead>
            <tbody>${queryRows}</tbody>
        </table>`;
    } else {
        divGeneral.innerHTML = `
        <table class="table table-sm table-hover table-bordered">
            <thead>${headerFactura}</thead>
            <tbody>${noFacturas}</tbody>
        </table>`;
    }
}

const loadTableDetalle = async id => {
    const divDetalle = document.querySelector('#divDetalleTable');

    const headerDetalle = `
    <tr>
        <th class="text-center" scope="col">Producto</th>
        <th class="text-center" scope="col">Cantidad</th>
        <th class="text-center" scope="col">Precio Unitario</th>   
        <th class="text-center" scope="col">Funciones</th>   
    </tr>`;

    const noDetalle = `<tr><td colspan="4" align="center"><span class="fw-bolder">No existen Detalles</span></td></tr>`

    const cargandoDetalle = `<tr><td colspan="4" align="center"><span class="fw-bolder">Cargando...</span></td></tr>`

    divDetalle.innerHTML = `
        <table class="table table-sm table-hover table-bordered">
            <thead>${headerDetalle}</thead>
            <tbody>${cargandoDetalle}</tbody>
        </table>`;

    listDetalles = await axiosGET(`${urlDetalleByFactura}/${id}`);

    if (!emptyObject(listDetalles)) {
        let queryRows = ``;
        listDetalles.forEach(item => {
            queryRows += `
            <tr>
                <td>${item.productoModel.producto}</td>
                <td>${item.cantidad}</td>
                <td>${item.precioUnitario}</td>              
                <td class="text-center" style="width: 10%">
                    <button class="btn btn-sm btn-danger" type="button" onClick="deleteDetalle('${item.id}', '${id}')">Eliminar</button>
                </td>
            </tr>`
        });

        divDetalle.innerHTML = `
        <table class="table table-sm table-hover table-bordered">
            <thead>${headerDetalle}</thead>
            <tbody>${queryRows}</tbody>
        </table>`;
    } else {
        divDetalle.innerHTML = `
        <table class="table table-sm table-hover table-bordered">
            <thead>${headerDetalle}</thead>
            <tbody>${noDetalle}</tbody>
        </table>`;
    }
}

const updateFactura = async (id) => {
    const title = document.querySelector('.modal-title');
    title.innerHTML = 'Modificar Factura';
    document.getElementById('divDetalle').removeAttribute('hidden');
    flagModificarFactura = true;
    const lista = listFacturas.find(item => item.id === Number(id));
    dataUpdate(lista);
    await loadTableDetalle(id);
    myModal.show();
}

const deleteFactura = async id => {
    const title = document.querySelector('.modal-title');
    title.innerHTML = 'Eliminar Factura';
    const flag = confirm('¿Deseas eliminar la factura?');
    if (flag) {
        await axiosDELETE(`${urlFactura}/${id}`);
        await loadTableFactura();
    }
}

const addFactura = async () => {
    const title = document.querySelector('.modal-title');
    title.innerHTML = 'Agregar Factura';
    document.getElementById('formModal').reset();
    document.getElementById('divDetalle').setAttribute('hidden', true);
    flagModificarFactura = false;
    myModal.show();
}

const consultProductos = async () => {
    const listProducts = await axiosGET(urlProducto);
    return listProducts;
}

const saveFactura = async () => {
    const form = document.getElementById('formModal');

    const formData = new FormData(form);

    let dataFactura = {};

    for (let item of formData) {
        dataFactura[item[0]] = item[1];
    }

    if (flagModificarFactura) {
        delete dataFactura.product;
        delete dataFactura.cantidad;
        delete dataFactura.precioUnitario;
    } else {
        delete dataFactura.idFactura
        dataFactura = {
            ...dataFactura,
            subtotal: 0,
            descuento: 0,
            iva: 19,
            totalDescuento: 0,
            totalImpuesto: 0,
            total: 0
        }
    }

    console.log('dataFactura', dataFactura);

    const currentDate = moment().format('YYYY-MM-DD');

    const intoDate = moment(dataFactura.fecha).format('YYYY-MM-DD');

    if (isEmpty(dataFactura.numero) || isEmpty(dataFactura.fecha) || isEmpty(dataFactura.pago) || isEmpty(dataFactura.documento) || isEmpty(dataFactura.nombre)) {
        alert('Debe Completar los datos requeridos');
        return;
    }

    if (intoDate < currentDate) {
        alert('La fecha no debe ser menor a la actual (' + currentDate + ')');
        return;
    }

    const resp = flagModificarFactura ? await axiosPUT(`${urlFactura}/${dataFactura.idFactura}`, dataFactura) : await axiosPOST(urlFactura, dataFactura);

    flagModificarFactura ?? form.reset();

    if (resp.status && resp.status !== 200 && resp.status !== 201) {
        myModal.hide();
        return;
    }

    flagModificarFactura ? await loadTableFactura() : addDetalle(resp.id);
}

const dataUpdate = async (lista) => {
    document.getElementById('idFactura').value = lista.id;
    document.getElementById('numero').value = lista.numero;
    document.getElementById('fecha').value = lista.fecha.split("T")[0];
    document.getElementById('documento').value = lista.documento;
    document.getElementById('pago').innerHTML = comboGeneric(arrTipoPago, 'name', true, lista.pago);
    document.getElementById('nombre').value = lista.nombre;
    document.getElementById('subtotal').value = lista.subtotal.toFixed(2);
    document.getElementById('descuento').value = lista.descuento;
    document.getElementById('totalDescuento').value = lista.totalDescuento.toFixed(2);
    document.getElementById('totalImpuesto').value = lista.totalImpuesto.toFixed(2);
    document.getElementById('total').value = lista.total.toFixed(2);
    const listProductos = await consultProductos();
    document.getElementById('product').innerHTML = comboGeneric(listProductos, 'producto', true);
}

const addDetalle = async (id) => {
    document.getElementById('divDetalle').removeAttribute('hidden');
    const listProductos = await consultProductos();
    document.getElementById('product').innerHTML = comboGeneric(listProductos, 'producto', true);
    document.getElementById('idFactura').value = id;
    flagModificarFactura = true;
    await loadTableDetalle(id);
}


const deleteDetalle = async (id, idFactura) => {
    const flag = confirm('¿Deseas eliminar el detalle?');
    if (flag) {
        await axiosDELETE(`${urlDetalle}/${id}`);
        await loadTableDetalle(idFactura);
        await calculoItems();
        await saveFactura();
    }
}

const saveDetalle = async () => {
    const cantidad = parseInt(document.getElementById('cantidad').value);
    const precioUnitario = parseInt(document.getElementById('precioUnitario').value)
    const producto = document.getElementById('product').value;

    if (cantidad <= 0 || precioUnitario < 0 || isEmpty(producto)) {
        alert('Debe Completar los datos requeridos');
        return;
    }

    let dateDetalle = {
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        productoModel: {
            id: parseInt(producto)
        },
        facturaModel: {
            id: parseInt(document.getElementById('idFactura').value)
        },
    }
    await axiosPOST(urlDetalle, dateDetalle);
    await loadTableDetalle(document.getElementById('idFactura').value);

    document.getElementById('product').value = '';
    document.getElementById('cantidad').value = 1;
    document.getElementById('precioUnitario').value = 0;

    calculoItems();
}

const changeDescuento = () => {
    calculoItems();
}

const calculoItems = async () => {
    let subtotal = 0;
    let totalImpuesto = 0;
    let inputDescuento = document.getElementById('descuento').value;
    let totalDescuento = 0;
    let iva = document.getElementById('iva').value;

    listDetalles.forEach(item => {
        subtotal += item.cantidad * item.precioUnitario;
    });

    totalImpuesto = (subtotal * iva) / 100;
    totalDescuento = (subtotal * inputDescuento) / 100;

    document.getElementById('subtotal').value = subtotal.toFixed(2);
    document.getElementById('totalImpuesto').value = totalImpuesto.toFixed(2);
    document.getElementById('totalDescuento').value = totalDescuento.toFixed(2);
    document.getElementById('total').value = ((subtotal + totalImpuesto) - totalDescuento).toFixed(2);
}