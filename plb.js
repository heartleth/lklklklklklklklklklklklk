module.exports = `const blockmap = {
    'ConsoleLog': {
        html: 'console log ?T',
        category: 'code',
        exec: ((stc, local, text) => console.log(text))
    },
    'Alert': {
        html: 'Alert ?T',
        category: 'ui',
        exec: ((stc, local, text) => {
            alert(text);
        })
    }
};`;