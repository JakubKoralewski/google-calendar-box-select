// Blocker will disable click reaction when holding e.g. 'B'
class Blocker {
    constructor() {
        this.blocker = document.createElement('div');
        this.blocker.id = 'blocker';
        this.created = false;
    }

    setState(parent, state) {
        //console.log(`toggle blocker ${state ? 'on' : 'off'}`);
        state
            ?
            parent.insertBefore(this.blocker, parent.firstChild) :
            parent.removeChild(this.blocker);
        this.created = state;
    }
}

export default Blocker;