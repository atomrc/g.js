/*jslint browser: true, nomen: true, plusplus:true  */
/*global browser:true, module:false, define:false*/
/*********************
 * MAIN NAMESPACE
 * *******************/
var Phygine = {};

(function (exports) {
    'use strict';
    if (typeof module !== "undefined" && module.exports) {
        module.exports = exports; // CommonJS
    } else if (typeof define === "function") {
        define(exports); // AMD
    } else {
        Phygine = exports; // <script>
    }
}((function () {
    'use strict';
    var exports = {},
        Utils = null,
        Vect = null,
        Force = null,
        Friction = null,
        Elastic = null,
        Gravity = null,
        GravityField = null,
        PhysicalElement = null,
        PhysicalContainer = null;

    Utils = {
        /*********************
         * REQUEST ANIMATION FRAME HELPER
         * *******************/
        requestAnimationFrame: function () {
            var raf = window.requestAnimationFrame     ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame    ||
                    window.oRequestAnimationFrame      ||
                    window.msRequestAnimationFrame     ||
                    function (callback) {
                        window.setTimeout(callback, 1000 / 60);
                    };
            return raf.bind(window);
        }
    };

    /*********************
     * SIMPLE VECTOR CLASS
     * *******************/
    Vect = function (x, y) {
        this.x = x;
        this.y = y;
    };

    Vect.prototype.add = function (v) {
        this.x += v.x;
        this.y += v.y;
    };

    Vect.prototype.subtract = function (v) {
        return new Vect(this.x - v.x, this.y - v.y);
    };

    Vect.prototype.scale = function (v) {
        this.x *= v.x;
        this.y *= v.y;
    };

    Vect.prototype.length = function () {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    };

    Vect.prototype.normalize = function () {
        var iLen = 1 / this.length();
        return new Vect(this.x * iLen, this.y * iLen);
    };

    /*********************
     * FORCES
     * *******************/
    Force = function (options) {
        this.options = options;
        this.acceleration = new Vect(0, 0);
        this.init();
    };

    Force.prototype = {
        acceleration: null,

        init: function () {},

        apply: function (physicalElement) {
            this._compute(physicalElement);
            this._apply(physicalElement);
        },

        //compute the new acceleration depending on the position of the physical element
        _compute: function (physicalElement) {},

        _apply: function (physicalElement) {
            physicalElement.accelerate(this.acceleration);
        }
    };

    Friction = function (options) {
        Force.call(this, options);
        this.acceleration = options.acceleration;
    };

    Friction.prototype = Object.create(new Force(), {

        _apply: {value: function (physicalElement) {
            physicalElement.applyFriction(this.acceleration);
        }}
    });

    Gravity = function (options) {
        Force.call(this, options);
        this.acceleration = options.acceleration;
    };

    Gravity.prototype = Object.create(new Force(), {});


    GravityField = function (options) {
        Force.call(this, options);
        this.acceleration = new Vect(0, 0);
        this.position = options.position;
        this.size = options.size;
    };

    GravityField.prototype = Object.create(new Force(), {
        position: {value: { x: 0, y: 0 }, writable: true},
        size: {value: 0, writable: true},
        rigidity: {value: 0.001, writable: true},

        _compute: {value: function (physicalElement) {
            var elementPosition = physicalElement.getPosition(),
                deltaX = this.position.x - elementPosition.x,
                deltaY = this.position.y - elementPosition.y,
                dist = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)),
                force = Math.min(this.size / dist, this.size);

            this.acceleration.x = force * deltaX;
            this.acceleration.y = force * deltaY;
        }}

    });


    Elastic = function (options) {
        Force.call(this, options);
        this.acceleration = new Vect(0, 0);
        this.position = options.position;
        this.size = options.size;
        if (options.rigidity) {
            this.rigidity = options.rigidity;
        }
    };

    Elastic.prototype = Object.create(new Force(), {
        position: {value: { x: 0, y: 0 }, writable: true},
        size: {value: 0, writable: true},
        rigidity: {value: 0.001, writable: true},

        _compute: {value: function (physicalElement) {
            var elementPosition = physicalElement.getPosition(),
                deltaX      = this.position.x - elementPosition.x,
                deltaY      = this.position.y - elementPosition.y,
                dist = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)),
                ratio = 0;

            if (dist <= this.size) {
                this.acceleration.y = 0;
                this.acceleration.x = 0;
                return;
            }
            ratio = (dist - this.size) / this.size;

            this.acceleration.x = ratio * deltaX * this.rigidity;
            this.acceleration.y = ratio * deltaY * this.rigidity;
        }}
    });

    /*********************
     * ELEMENT
     * *******************/
    PhysicalElement = function (domElement, position) {
        this.element = domElement;
        this.element.classList.add('physical-element');
        this.element.style.position = "absolute";
        this.speed = new Vect(0, 0);
        this.position = new Vect(position.x, position.y);
        this.size = {};
        this.forces = [];
        this.initEvents();
    };

    PhysicalElement.prototype = {
        element: null,
        speed: null,
        position: null,
        forces: [],
        freezed: false,
        clientPosition: null,

        initEvents: function () {
            var followClient, freeze, unfreeze;

            followClient = function (e) {
                var newPosition     = new Vect(e.clientX, e.clientY),
                    diff            = this.clientPosition.subtract(newPosition);

                this.position       = this.position.subtract(diff);
                this.clientPosition = newPosition;
            }.bind(this);

            freeze = function (e) {
                this.freeze(e.clientX, e.clientY);
                document.addEventListener('mousemove', followClient);
            }.bind(this);

            unfreeze = function (e) {
                this.unfreeze();
                document.removeEventListener('mousemove', followClient);
            }.bind(this);

            this.element.addEventListener('mousedown', freeze);
            this.element.addEventListener('mouseup', unfreeze);
        },

        freeze: function (x, y) {
            this.freezed = true;
            this.speed.x = 0;
            this.speed.y = 0;
            this.clientPosition = new Vect(x, y);
        },

        unfreeze: function () {
            this.freezed = false;
        },

        applyForce: function (force) {
            if (!this.freezed) {
                force.apply(this);
            }
        },

        update: function () {
            var i;
            for (i = 0; i < this.forces.length; i++) {
                this.applyForce(this.forces[i]);
            }
            this.position.add(this.speed);
        },

        // add a force that will apply on the element on each frame of the application
        addForce: function (force) {
            this.forces.push(force);
        },

        setPosition: function (position) {
            this.position.x = position.x;
            this.position.y = position.y;
        },

        getPosition: function () {
            return this.position;
        },

        accelerate: function (vect) {
            this.speed.add(vect);
        },

        applyFriction: function (vect) {
            this.speed.scale(vect);
        },

        render: function () {
            var deltaX = this.position.x.toFixed(0),
                deltaY = this.position.y.toFixed(0);
            this.element.style.left = deltaX + 'px';
            this.element.style.top = deltaY + 'px';
        }
    };

    /*********************
     * CONTAINER
     * *******************/
    PhysicalContainer = function (container) {
        this.container = container;
        this.height = parseInt(window.getComputedStyle(this.container, null).getPropertyValue('height'), 10);
        this.width = parseInt(window.getComputedStyle(this.container, null).getPropertyValue('width'), 10);
        this.container.classList.add('elasto-container');
        this.container.style.position = "relative";
        this.elements = [];
        this.forces = [];
        this.raf = Utils.requestAnimationFrame();
        window.ondragstart = function () { return false; };
    };

    PhysicalContainer.prototype = {
        raf: null,
        container: null,
        height: 0,
        width: 0,
        elements: [],
        forces: [],

        run: function () {
            this.update();
            this.render();
            var frame = this.run.bind(this);
            this.raf(frame);
        },

        addForce: function (force) {
            this.forces.push(force);
        },

        add: function (physicalElement) {
            var randomX = parseInt(Math.random() * this.width, 10);
            physicalElement.setPosition({x: randomX, y: 0});
            this.elements.push(physicalElement);
        },

        update: function () {
            var elIndex,
                element;
            for (elIndex = 0; elIndex < this.elements.length; elIndex++) {
                element = this.elements[elIndex];
                this._applyForces(element);
                element.update();
            }
        },

        render: function () {
            var elIndex;
            for (elIndex = 0; elIndex < this.elements.length; elIndex++) {
                this.elements[elIndex].render();
            }
        },

        _applyForces: function (element) {
            var fi;
            for (fi = 0; fi < this.forces.length; fi++) {
                element.applyForce(this.forces[fi]);
            }
        }
    };

    exports.Vect = Vect;
    exports.Gravity = Gravity;
    exports.Friction = Friction;
    exports.Elastic = Elastic;
    exports.PhysicalContainer = PhysicalContainer;
    exports.PhysicalElement = PhysicalElement;

    return exports;

}())));
