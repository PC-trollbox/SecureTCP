module.exports = function(length, table) {
    if (table.hasOwnProperty(length)) return table[length];
    while (!table[length] && length > 181) length = length - 1;
    return table[length];
}