const axiosGET = async url => {
    if (!url) return Promise.reject('No se ha recibido la ruta del servicio.');

    const requestInit = {
        headers: oAuthHeader(),
    }

    return await axios.get(url, requestInit)
        .then(response => handleResponse(response))
        .catch(error => handleError(error));
}

const axiosPOST = async (url, data) => {
    if (!url) return Promise.reject('No se ha recibido la ruta del servicio.');

    if (!data) return Promise.reject('No se ha recibido el objeto de datos.');

    const requestInit = {
        headers: oAuthHeader(),
    }

    return await axios.post(url, data, requestInit)
        .then(response => handleResponse(response))
        .catch(error => handleError(error));
}

const axiosPUT = async (url, data) => {
    if (!url) return Promise.reject('No se ha recibido la ruta del servicio.');

    if (!data) return Promise.reject('No se ha recibido el objeto de datos.');

    const requestInit = {
        headers: oAuthHeader(),
    }

    return await axios.put(url, data, requestInit)
        .then(response => handleResponse(response))
        .catch(error => handleError(error));
}

const axiosDELETE = async (url) => {
    if (!url) return Promise.reject('No se ha recibido la ruta del servicio.');

    const requestInit = {
        headers: oAuthHeader()
    }

    return await axios.delete(url, requestInit)
        .then(response => handleResponse(response))
        .catch(error => handleError(error));
}

const oAuthHeader = () => {
    return {
        'Content-Type': 'application/json',
    };
}

const handleResponse = async response => {
    if (response.status < 200 || response.status > 300) {
        return Promise.reject(response);
    }

    return response.data;
}

const handleError = async error => {
    if (error.response) {
        return Promise.reject(error.response)
            .then(response => response)
            .catch(err => err);
    } else if (String(error) === 'Error: Network Error') {
        return Promise.reject('Error de Red, no se pudo establecer la conexión.');
    } else {
        return Promise.reject(error);
    }
};

//  const manageError = async (response, flagLogin = false) => {
//     try {
//         if (flagLogin && response.status && (Number(response.status) === 401 || Number(response.status) === 403)) {
//             cleanStorage();
//             throw "Credenciales incorrectas.";
//         }

//         if (response.status && (Number(response.status) === 401 || Number(response.status) === 403)) {
//             goIndex();
//             throw "Su sesión ha finalizado.";
//         }

//         if (response.status && (Number(response.status) === 500 || Number(response.status) === 503)) {
//             if (response.codeIn && (Number(response.codeIn) === 500 || Number(response.codeIn) === 503)) {
//                 throw response.mensaje;
//             } else if (response.data) {
//                 const dataResponse = response.data;
//                 if (dataResponse.codeIn && (Number(dataResponse.codeIn) === 500 || Number(dataResponse.codeIn) === 503)) {
//                     throw dataResponse.mensaje;
//                 }

//                 throw "Ha ocurrido un error interno en el servidor [" + dataResponse.codeIn + "].";
//             } else {
//                 throw "Ha ocurrido un error, no se pudo establecer la conexión.";
//             }
//         }

//         return response;
//     } catch (error) {
//         handleErrorView(error);
//     }
// }