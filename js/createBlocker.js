/* eslint-disable no-console */

const blocker = document.createElement('div');
blocker.style.position = 'absolute';
blocker.style.width = '100%';
blocker.style.height = '100%';
blocker.style.left = '0';
blocker.style.top = '0';

export function setBlocker(parent, state) {
    console.log('toggle blocker');
    if (state === 1) {
        parent.appendChild(blocker);
    } else if (state === 0) {
        parent.removeChild(blocker);
    } else {
        console.error(`state should be 1 or 0, was ${state}`);
    }
}
