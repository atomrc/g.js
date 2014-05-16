/*global browser:true, module, define*/
/*********************
 * MAIN NAMESPACE
 * *******************/
var G = {};

(function (exports) {
    "use strict";
    if (typeof module !== "undefined" && module.exports) {
        module.exports = exports; // CommonJS
    } else if (typeof define === "function") {
        define(exports); // AMD
    } else {
        G = exports; // <script>
    }
}(function () {
    "use strict";
    var Container,
        Force,
        Element;

    Container = function () {
        this.elements = [];
        this.forces = [];
    };

    Container.prototype = {
        /**
         * frame - apply all the forces to all the elements
         * to compute the new speed of each element
         *
         * @return {void}
         */
        frame: function () {
            var e,
                element,
                f;

            for (e in this.elements) {
                if (this.elements.hasOwnProperty(e)) {
                    element = this.element[e];

                    //apply global forces
                    for (f in this.forces) {
                        this.applyForce(element, this.forces[f]);
                    }

                    //apply element specific forces
                    for (f in element.forces) {
                        this.applyForce(element, element.forces[f]);
                    }
                }
            }
        },

        applyForce: function (element, force) {
        }
    };

    Force = function () {
    };

    /**
     * Element - represents a physicial element on which forces will be applied
     *
     * @param position - the initial position of the element
     *  { x: 0, y: 0 }
     * @return Element
     */
    Element = function (position) {
        this.position = position; //the initial position of the element
        this.speed = { dx: 0, dy: 0 }; //the initial speed of the element
        this.forces = []; //all the forces only applied to this element
    };

    return {
        Container: Container,
        Force: Force,
        Element: Element
    };
}()));
