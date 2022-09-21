const defaultController = require('./defaultController')

function generateControllers({ herbarium, controller = defaultController }) {
    const entities = findEntitiesAndGroups(herbarium)

    const controllers = entities.map(item => {
        let entity = item.entity
        if (typeof item.entity === 'string') entity = herbarium.entities.get(item.entity).entity
        const usecases = findUsecases(herbarium, item.entity)
        const resourceId = entity.schema.fields.find(f => f.options.isId)
        return {
            entity: entity,
            name: item.group,
            getAll: { usecase: usecases.getAll, controller },
            getById: { usecase: usecases.getById, controller, id: (resourceId?.name || 'id') },
            post: { usecase: usecases.post, controller },
            put: { usecase: usecases.put, controller },
            delete: { usecase: usecases.del, controller }
        }
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
    const getAll = usecases.findBy({ entity: entity, operation: herbarium.crud.readAll })[0].usecase
    const getById = usecases.findBy({ entity: entity, operation: herbarium.crud.read })[0].usecase
    const post = usecases.findBy({ entity: entity, operation: herbarium.crud.create })[0].usecase
    const put = usecases.findBy({ entity: entity, operation: herbarium.crud.update })[0].usecase
    const del = usecases.findBy({ entity: entity, operation: herbarium.crud.delete })[0].usecase
    return { getAll, getById, post, put, del }
}

module.exports = generateControllers
