
// based on the herbarium and the metadata from the usecases, generate the endpoints on the server (express)
function generateEndpoints({ herbarium, server }) {

    for (let uc of herbarium.usecases.all) {
        onst[ucName, info] = uc
        const REST = info.REST

        if (REST) {
            const { verb, path, controller } = REST
            if (verb === 'GET') server.get(path, controller)
            if (verb === 'POST') server.post(path, controller)
            if (verb === 'PUT') server.put(path, controller)
            if (verb === 'DELETE') server.delete(path, controller)
        }
    }
}