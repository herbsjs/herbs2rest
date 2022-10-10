const defaultController = require('./defaultController')

function generateControllers({ herbarium, controller = defaultController }) {
    const entities = findEntitiesAndGroups(herbarium)

    const controllers = entities.map(item => {
        let entity = item.entity
        if (typeof item.entity === 'string') entity = herbarium.entities.get(item.entity).entity
        const usecases = findUsecases(herbarium, item.entity)
        const resourceId = entity.schema.fields.find(f => f.options.isId)
        let controllerList = {
            entity: entity,
            name: item.group,
            getAll: usecases.getAll ? { usecase: usecases.getAll, controller } : undefined,
            getById: usecases.getById ? { usecase: usecases.getById, controller, id: (resourceId?.name || 'id') } : undefined,
            post: usecases.post ? { usecase: usecases.post, controller } : undefined,
            put: usecases.put ? { usecase: usecases.put, controller } : undefined,
            delete: usecases.del ? { usecase: usecases.del, controller } : undefined
        }

        Object.keys(controllerList).forEach(key => {
            if (controllerList[key] === undefined) {
                delete controllerList[key];
            }
        })

        return controllerList

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
    const getAll = usecases.findBy({ entity: entity, operation: herbarium.crud.readAll })[0]?.usecase
    const getById = usecases.findBy({ entity: entity, operation: herbarium.crud.read })[0]?.usecase
    const post = usecases.findBy({ entity: entity, operation: herbarium.crud.create })[0]?.usecase
    const put = usecases.findBy({ entity: entity, operation: herbarium.crud.update })[0]?.usecase
    const del = usecases.findBy({ entity: entity, operation: herbarium.crud.delete })[0]?.usecase
    return { getAll, getById, post, put, del }
}

module.exports = generateControllers
