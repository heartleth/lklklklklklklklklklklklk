let blockmap = {
    'return': { category: 'value' },
    'JavaScript': { category: 'code' },
    'ConsoleLog': {
        category: 'code',
        exec: (cas, text) => {
            const t = getValue(text, cas.local);
            console.log(t);
            cas.clientActs.push(['ConsoleLog', t]);
        }
    },
    'Alert': {
        category: 'ui',
        exec: (cas, text) => {
            const t = getValue(text, cas.local);
            cas.clientActs.push(['Alert', t]);
        }
    },
    'Href': {
        category: 'ui',
        exec: (cas, url) => {
            const t = getValue(url, cas.local);
            cas.clientActs.push(['Href', t]);
        }
    },
    'HasId': { category: 'ui' },
    'ValueOf': {
        category: 'ui'
    },
    'State': {
        category: 'value'
    },
    'Local': {
        category: 'value'
    },
    'PlusMinus': {
        category: 'value'
    },
    'Find': {
        category: 'ui'
    },
    'Hide': {
        category: 'ui'
    },
    'Show': {
        category: 'ui'
    },
    'AppendHTML': {
        category: 'ui'
    },
    'SetState': {
        category: 'value'
    },
    'SetLocal': {
        category: 'value'
    },
    'IfOrd': {
        category: 'control'
    },
    'WhileOrd': {
        category: 'control'
    }
};

function getActionType(name) {
    if (name.startsWith('INSERTINTO')) return 'db';
    
    if (blockmap[name]) return blockmap[name].category;
}

function compileAction(actionName, actions) {
    let clientAction = {
        name: 'ServerSideAction',
        sendInputs: [],
        actionName
    };
    for (const action of actions) {
        if (!action) continue;
        if (action.substring) continue;
        const actionType = getActionType(action.name);
        if (action.name == 'State') {
            clientAction.sendInputs.push(['#State', action.params[0]]);
        }
        else if (action.name == 'Find') {
            clientAction.sendInputs.push(['#Find', action.params[0], action.params[1]]);
        }
        if (action.params) {
            clientAction.sendInputs = clientAction.sendInputs.concat(compileAction('', action.params).sendInputs);
        }
        if (action.child) {
            clientAction.sendInputs = clientAction.sendInputs.concat(compileAction('', action.child).sendInputs);
        }
    }
    return clientAction;
}

module.exports = { compileAction };

function getValue(v, local) {
    if (!v.substring && v.name) {
        return blockmap[v.name].exec([], local, ...v.params.map(e=>getValue(e, local)));
    }
    if (v.startsWith) {
        if (v.startsWith('#Local:')) {
            return window.locals[local][v.substring(7)];
        }
        else if (v.startsWith('#State:')) {
            return window.states[v.substring(7)];
        }
    }
    return v;
}