class Selection {
    constructor(startX, startY, parent) {
        this.x = startX;
        this.y = startY;

        let element = document.createElement('div');
        element.style.left = `${startX}px`;
        element.style.top = `${startY}px`;

        element.id = 'selector';
        this.element = element;

        this.parent = parent;
        Selection.visible = true;

        this.parent.insertBefore(this.element, this.parent.firstChild);
    }

    display(x, y) {
        // https://stackoverflow.com/questions/30983000/how-to-workaround-a-negative-height-and-width

        this.element.style.width = Math.abs(x - this.x) + 'px';
        this.element.style.height = Math.abs(y - this.y) + 'px';

        if (y < this.y) {
            this.element.style.top = y + 'px';
            this.element.style.height = Math.abs(y - this.y) + 'px';
        }
        if (x < this.x) {
            this.element.style.left = x + 'px';
            this.element.style.width = Math.abs(x - this.x) + 'px';
        }
    }

    destroy() {
        this.parent.removeChild(this.element);
        Selection.visible = false;
    }

    selectedEvents(events) {
        let selected = new Set();

        // 102px (string) -> 102 (number)
        let left = this.element.style.left;
        left = parseInt(left.substring(0, left.length - 2));

        let top = this.element.style.top;
        top = parseInt(top.substring(0, top.length - 2));

        let height = this.element.style.height;
        height = parseInt(height.substring(0, height.length - 2));

        let width = this.element.style.width;
        width = parseInt(width.substring(0, width.length - 2));

        let right = left + width;
        let bottom = top + height;

        events.forEach(event => {
            let b = event.getBoundingClientRect();

            const eventsLeftEdgeToTheLeftOfRightEdge = b.left < right;
            const eventsRightEdgeToTheRightOfLeftEdge = b.right > left;
            const eventsTopAboveBottom = b.top < bottom;
            const eventsBottomBelowTop = b.bottom > top;

            // If event overlaps selector
            if (
                eventsLeftEdgeToTheLeftOfRightEdge &&
                eventsRightEdgeToTheRightOfLeftEdge &&
                eventsTopAboveBottom &&
                eventsBottomBelowTop
            ) {
                selected.add(event);
            }
        });
        return selected;
    }
}

export default Selection;