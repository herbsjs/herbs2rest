const defaultController = require('./defaultController')

function generateControllers({ herbarium, controller = defaultController }) {
    const entities = findEntitiesAndGroups(herbarium)

    const controllers = entities.map(item => {
        let entity = item.entity
        if (typeof item.entity === 'string') entity = herbarium.entities.get(item.entity).entity
        const usecases = findUsecases(herbarium, item.entity)
        const resourceId = entity.schema.fields.find(f => f.options.isId)
        let controllerInfos = {
            entity: entity,
            name: item.group,
            getAll: usecases.getAll ? { usecase: usecases.getAll.usecase, controller, REST: usecases.getAll.REST } : undefined,
            getById: usecases.getById ? { usecase: usecases.getById.usecase, controller, REST: usecases.getById.REST, id: (resourceId?.name || 'id') } : undefined,
            post: usecases.post ? { usecase: usecases.post.usecase, controller, REST: usecases.post.REST } : undefined,
            put: usecases.put ? { usecase: usecases.put.usecase, controller, REST: usecases.put.REST } : undefined,
            delete: usecases.del ? { usecase: usecases.del.usecase, controller, REST: usecases.del.REST } : undefined
        }

        Object.keys(controllerInfos).forEach(key => {
            if (controllerInfos[key] === undefined) {
                delete controllerInfos[key]
            }
        })

        return controllerInfos

    })
    return controllers
}

function findEntitiesAndGroups(herbarium) {
    const items = Array.from(herbarium.usecases.all.values()).map(usecaseItem =>
        ({ entity: usecaseItem.entity, group: usecaseItem.group })
    )
    const distinctItems = items.filter(({ entity, group }, index, self) =>
        self.findIndex(usecaseItem => usecaseItem.entity === entity && usecaseItem.group === group) === index
    )
    return distinctItems
}

function findUsecases(herbarium, entity) {
    const usecases = herbarium.usecases
    const getAll = usecases.findBy({ entity: entity, operation: herbarium.crud.readAll })[0]
    const getById = usecases.findBy({ entity: entity, operation: herbarium.crud.read })[0]
    const post = usecases.findBy({ entity: entity, operation: herbarium.crud.create })[0]
    const put = usecases.findBy({ entity: entity, operation: herbarium.crud.update })[0]
    const del = usecases.findBy({ entity: entity, operation: herbarium.crud.delete })[0]
    return { getAll, getById, post, put, del }
}

module.exports = generateControllers
