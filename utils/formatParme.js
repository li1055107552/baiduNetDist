module.exports = function formatParme(parme) {
    let res = []
    for (const key in parme) {
        if (Object.hasOwnProperty.call(parme, key)) {
            const value = parme[key];
            if (value.constructor == Array) {
                res.push(`${key}=["${value.join('","')}"]`)
                continue
            }
            if (value.constructor == Object) {
                res.push(`${key}=` + formatParme(value))
                continue
            }
            res.push(`${key}=${value}`)
        }
    }
    return res.join("&")
}