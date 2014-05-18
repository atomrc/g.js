G.js
============

Gravity in the browser

Live exemple http://find.thomasbelin.fr

Let the magic happen
-----------------

Create the container that will handle all the update/render loop

```javascript
var container = new G.Container(),
```

Add any forces you like to the container, they will be applied to any point added to the container.

```javascript
gravity = new G.GlobalForce(0, 0.5); //just give the vector of the force
container.forces.push(gravity); //add the force to the container
```

Then it's time to add points to your container. They will be moved depending on the force you have setted

```javascript
//dat namespace :)
var point = new G.Point(
    {
        x: 0, //the initial x coordinate of the point
        y: 0, //the initial y coordinate of the point
        staticFriction: 0.01, //the static friction to apply to the point
        kineticFriction: 0.99 //the kinetic friction to apply to the point
    },
    //last parameter is the callback called on each loop for you to render the point as you wish :)
    return function () {
        //this represent the current point being rendered
        domElement.style.top = this.position.y;
        domElement.style.left = this.position.x;
    }
);

//add the point to the main container
container.points.push(point);
```

Then why not adding some forces that are specific to a single point

```javascript
var elastic = new G.CenteredForce({
    center: { x: Math.random() * (500 - 100) + 100, y: Math.random() * (500 - 100) + 100 },
    stiffness: 0.001,
    offset: 50
});
//add the force to the array of forces applied on that specific point
point.forces.push(elastic);
```

Run and enjoy
```Javascript
container.run();
```
