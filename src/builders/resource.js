class Resource {
    constructor({ usecase: { entity, id } }) {
        this.entity = entity
        this.usecaseID = id
    }

    build() {
        let resourceName = this.entity?.name || this.usecaseID
        if (!resourceName) return
        resourceName = this.toPlural(resourceName)
        resourceName = this.toCamelCase(resourceName)
        return resourceName
    }

    toCamelCase(string) {
        // string to camelCase
        return string
            .replace(/(?:^\w|[A-Z]|\b\w)/g,
                (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase())
            .replace(/\s+/g, '')
    }

    toPlural(name) {
        // english rules
        if (name.endsWith('y')) return name.slice(0, -1) + 'ies'
        if (name.endsWith('s')) return name + 'es'
        return name + 's'
    }
}

module.exports = { Resource }