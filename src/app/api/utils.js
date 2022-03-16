const codigoAleatorio = (chars, lon) => {
    let code = "";
    let rand;

    for (let x = 0; x < lon; x++) {
        rand = Math.floor(Math.random() * chars.length);
        code += chars.substr(rand, 1);
    }

    return code;
}

const generar = () => {
    var caracteres = "0123456789abcdefghijklmnñopqrstuvwyzABCDEFGHIJKLMNÑOPQRSTUVWXYZ?¿¡!:*+-_#$%&;";
    var valor = codigoAleatorio(caracteres, 20);
    return valor;
}

const isEmpty = str => {
    if (!str || str === undefined || str === null)
        return true;

    return (str.trim().length === 0 || str.trim() == '');
}

const emptyObject = obj => {
    if (!obj) { return true }

    return Object.entries(obj).length === 0;
}

const loader = id => {
    let query = `<div class="d-flex justify-content-center my-2">
        <div class="spinner-border" style="color: #ad3333 !important" role="status"><span class="visually-hidden">Loading...</span></div></div>`;

    if (id) {
        document.querySelector(id).innerHTML = query;
    }

    return query;
}

const loaderBtn = (id, flag = true, attName = 'Aceptar') => {
    const query = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"/>`;

    if (id) {
        const btn = document.querySelector(id);
        if (btn) {
            if (flag) {
                btn.innerHTML = query;
                btn.setAttribute('disabled', true);
            } else {
                btn.innerHTML = attName;
                btn.removeAttribute('disabled');
                return;
            }
        }
    }

    return query;
}

const loaderScreen = id => {
    if (!id) {
        console.log('No se ha recibido el id del spinner');
        return;
    }

    let spinn = `<div class="d-flex justify-content-center align-items-center" style="height:100vh;">
        <div class="spinner-border spinner-screen" role="status"></div>
    </div>`

    document.querySelector(id).innerHTML = spinn;
}

const cleanStorage = () => {
    sessionStorage.clear();
    localStorage.clear();
}

const comboGeneric = (array, name = null, selectedBlank = false, idValue = '') => {
    let query = '';

    if (selectedBlank) {
        query += '<option value="">Seleccione</option>';
    }

    if (!emptyObject(array) && !name) {
        query += array.map(item => `<option value='${item.id}' ${!isEmpty(idValue) && String(item.id) === String(idValue) ? 'selected' : ''}>${item.nombre}</option>`);
    }

    if (!emptyObject(array) && name) {
        query += array.map(item => `<option value='${item.id}' ${!isEmpty(idValue) && String(item.id) === String(idValue) ? 'selected' : ''}>${item[name]}</option>`);
    }

    return query;
}

const getDataCombo = id => {
    const combo = document.querySelector(id);
    const idCombo = combo.value;
    const textCombo = combo.options[combo.selectedIndex].text;

    return { idCombo, textCombo };
}