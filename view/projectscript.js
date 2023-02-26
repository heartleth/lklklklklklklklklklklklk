let dru = require('drauu');

let drauu = dru.createDrauu({
    el: '#svg',
    brush: {
        mode: 'line',
        color: 'skyblue',
        size: 5,
    },
});
drauu.options.brush.color = 'red';