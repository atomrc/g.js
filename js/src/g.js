/*global window, module, define*/
/*********************
 * MAIN NAMESPACE
 * *******************/
var G = {};

/*
 *
 * a force is defined by :
 *
 *
 ***/
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


    function Container() {
        this.points = [];
        this.forces = [];
    }
    Container.prototype = {

        paused: false,
        /**
         * update - apply all the forces to all the points
         * to compute the new speed of each point
         *
         * @return {void}
         */
        update: function update() {
            var p,
                point,
                f;

            for (p in this.points) {
                point = this.points[p];

                //apply global forces
                for (f in this.forces) {
                    this.forces[f].apply(point);
                }

                //apply point specific forces
                for (f in point.forces) {
                    point.forces[f].apply(point);
                }

                //finally compute the new position of the point
                //depending on the speed previously computed
                this.points[p].update();
            }
        },

        render: function render() {
            var p;
            for (p in this.points) {
                this.points[p].render();
            }
        },

        /**
         * run - a single run of the animation loop
         *
         * @return
         */
        run: function run() {
            this.update(); //update the state of the application
            this.render(); //rendering the new computed step
            if (!this.paused) {
                window.requestAnimationFrame(this.run.bind(this));
            }
            //setTimeout(this.run.bind(this), 300);
        },

        /**
         * pause - pauses the animation loop
         *
         * @return
         */
        pause: function pause() {
            this.paused = true;
        },

        /**
         * restart - reset the state of the application to the initial state
         * and relauch the animation loop (if paused)
         *
         * @return
         */
        restart: function restart() {
            this.paused = false;
            this.reset();
            this.run();
        },

        resume: function resume() {
            this.paused = false;
            this.run();
        },

        /**
         * reset - reset to the initial state of the application
         * does not pause the animation
         *
         * @return
         */
        reset: function reset() {
            for (var i in this.points) {
                //reset eash single point of the container
                this.points[i].reset();
            }

            //render the new state of the application
            this.render();
        }
    };

    function GlobalForce(dx, dy) {
        this.dx = dx;
        this.dy = dy;
    }
    GlobalForce.prototype = {
        apply: function (point) {
            point.speed.dx += this.dx;
            point.speed.dy += this.dy;
        }
    };

    function CenteredForce(params) {
        var defaults = {
            //point where the source of the force is
            center: { x: 0, y: 0 },

            //the force applyied on the points
            stiffness: 1,

            //the distance under which the force has no power on points
            offset: 0,

            //the direction of the force (1 attract, -1 repel)
            direction: 1
        };

        for (var i in defaults) {
            this[i] = params[i] || defaults[i];
        }
    }
    CenteredForce.prototype = {

        apply: function (point) {
            var deltaX = this.center.x - point.position.x,
                deltaY = this.center.y - point.position.y,
                dist = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)),
                force;

            //take one thousands of the distance as the base force
            //the stiffness will adjust this force
            force = (dist - this.offset) / 1000;

            //if the point is closer to the center of the force
            //than the given offset, then there is nothing to do
            if (force <= 0) { return; }

            //for a positive direction will increase the force the point is farther
            //for a negative one will decrease the force if the point is farther
            force = this.stiffness * Math.pow(force, this.direction);
            point.speed.dx += this.direction * force * deltaX;
            point.speed.dy += this.direction * force * deltaY;
        }
    };

    /**
     * Point - represents a physicial point on which forces will be applied
     *
     * @param position - the initial position of the point
     *  { x: 0, y: 0 }
     * @return Point
     */
    function Point(params, render) {
        var defaultValues = {
            position: { x: 0, y: 0 },

            //The force that will try to compensate the force applied to the point
            //a number between 0 and 1 that will scale the speed of the object
            kineticFriction: 1,

            staticFriction: 0
        };
        this.position = params.position || defaultValues.position; //the initial position of the point
        this.initPosition = { x: this.position.x, y: this.position.y };
        this.kineticFriction = params.kineticFriction || defaultValues.kineticFriction;
        this.staticFriction = params.staticFriction || defaultValues.staticFriction;
        this.speed = { dx: 0, dy: 0 }; //the initial speed of the point
        this.forces = []; //all the forces only applied to this point
        this.render = render.bind(this) || function () {};
    }
    Point.prototype = {

        /**
         * update - update the position of the point depending on its speed
         *
         * @return {void}
         */
        update: function update() {
            //apply friction on the speed of the point
            this.speed.dx *= this.kineticFriction;
            this.speed.dy *= this.kineticFriction;

            //update the position of the point
            this.position.x = this.position.x + this.speed.dx;
            this.position.y = this.position.y + this.speed.dy;
        },

        /**
         * reset - reset the point at its inital position and speed
         *
         * @return
         */
        reset: function reset() {
            this.speed.dx = 0;
            this.speed.dy = 0;
            this.position.x = this.initPosition.x;
            this.position.y = this.initPosition.y;
        }
    };

    return {
        Container: Container,
        GlobalForce: GlobalForce,
        CenteredForce: CenteredForce,
        Point: Point
    };
}()));
