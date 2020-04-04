function newElement(element, attributes, children) {
    var temp = document.createElement(element);

    if (typeof children != 'undefined') {
        append(temp, children);
    }

    if (typeof attributes != 'undefined') addAttributes(temp, attributes);
    return temp;
}

function addAttributes(element, attributes) {
    const prop = ['name', 'class', 'id']
    for (var attribute in attributes) {
        if (attributes.hasOwnProperty(attribute)) {
            if (prop.indexOf(attribute) !== -1) {
                element.setAttribute(attribute, attributes[attribute])
            } else {
                element[attribute] = attributes[attribute]
            }

        }

    }
}


function append(parent, children) {
    children.forEach(el => {
        if (el.nodeType) {
            if (el.nodeType === 1 || el.nodeType === 11) {
                parent.appendChild(el);
            }
        } else {
            parent.innerHTML += el;
        }
    })
}