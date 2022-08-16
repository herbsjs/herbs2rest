function generateControllers(herbarium) {
    const entities = findEntitiesAndGroups(herbarium)

    const controllers = entities.map(entity => {
        const ucList = findUsecases(herbarium, entity.id)
        return {
            entity: entity.id,
            name: entity.group,
            getAll: { usecase: ucList.getAll },
            getById: { usecase: ucList.getById, id: 'ids' },
            post: { usecase: ucList.post },
            put: { usecase: ucList.put },
            delete: { usecase: ucList.del }
        }
    })
    return controllers
}

function findEntitiesAndGroups(herbarium) {
    const items = Array.from(herbarium.usecases.all.values()).map(usecaseItem =>
        ({ id: usecaseItem.entity, group: usecaseItem.group })
    )
    const distinctItems = items.filter(({ entity, group }, index, self) =>
        self.findIndex(usecaseItem => usecaseItem.entity === entity && usecaseItem.group === group) === index
    )
    return distinctItems
}

function findUsecases(herbarium, entity) {
    const usecases = herbarium.usecases
    const getAll = usecases.findBy({ entity: entity, operation: herbarium.crud.read })[0].usecase
    const getById = usecases.findBy({ entity: entity, operation: herbarium.crud.read })[0].usecase
    const post = usecases.findBy({ entity: entity, operation: herbarium.crud.create })[0].usecase
    const put = usecases.findBy({ entity: entity, operation: herbarium.crud.update })[0].usecase
    const del = usecases.findBy({ entity: entity, operation: herbarium.crud.delete })[0].usecase
    return { getAll, getById, post, put, del }
}

module.exports = {generateControllers}
